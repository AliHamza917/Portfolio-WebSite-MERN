const fs = require("fs");
const path = require("path");
const readline = require("readline");

const envPath = fs.existsSync(path.join(__dirname, ".env"))
  ? path.join(__dirname, ".env")
  : path.join(__dirname, "..", ".env");
require("dotenv").config({ path: envPath });

const mongoose = require("mongoose");
const User = require("../models/user-model");
const { validatePasswordStrength } = require("./auth-validator");

const promptForSecret = (prompt) =>
  new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      reject(new Error("Run this command in an interactive terminal."));
      return;
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write(prompt);
    let value = "";

    const cleanup = () => {
      process.stdin.removeListener("keypress", onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    const onKeypress = (input, key = {}) => {
      if (key.ctrl && key.name === "c") {
        cleanup();
        process.stdout.write("\n");
        reject(new Error("Password reset cancelled."));
        return;
      }

      if (key.name === "return" || key.name === "enter") {
        cleanup();
        process.stdout.write("\n");
        resolve(value);
        return;
      }

      if (key.name === "backspace") {
        value = value.slice(0, -1);
        return;
      }

      if (!key.ctrl && !key.meta && input && !/[\x00-\x1f\x7f]/.test(input)) {
        value += input;
      }
    };

    process.stdin.on("keypress", onKeypress);
  });

const resetAdminPassword = async () => {
  const mongoUri = process.env.MONGO_URI;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!mongoUri || !adminEmail) {
    throw new Error(
      `Set MONGO_URI and ADMIN_EMAIL in ${envPath} before running this command.`
    );
  }

  const password = await promptForSecret("New admin password (input hidden): ");
  const confirmation = await promptForSecret("Confirm new password: ");
  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    const user = await User.findOne({ email: adminEmail, role: "admin" }).select(
      "+sessionVersion"
    );
    if (!user) {
      throw new Error("No admin account matches ADMIN_EMAIL.");
    }

    user.password = password;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.pendingTwoFactorSecret = undefined;
    user.pendingTwoFactorExpiresAt = undefined;
    user.mfaChallengeHash = undefined;
    user.mfaChallengeExpiresAt = undefined;
    await user.save();
  } catch (error) {
    if (error.message === "No admin account matches ADMIN_EMAIL.") {
      throw error;
    }
    if (
      error.code === "ENOTFOUND" ||
      error.cause?.code === "ENOTFOUND" ||
      error.name === "MongoServerSelectionError" &&
        error.reason?.servers &&
        [...error.reason.servers.values()].some(
          (server) => server.error?.code === "ENOTFOUND"
        )
    ) {
      throw new Error(
        "MongoDB hostname could not be resolved. Check that MONGO_URI contains the exact Atlas hostname (for example, cluster0.xxxxx.mongodb.net), with no placeholder text, spaces, or misspelling."
      );
    }
    if (error.name === "MongoServerSelectionError") {
      throw new Error(
        "Could not reach MongoDB. Check the cluster hostname in MONGO_URI, Atlas Network Access IP allowlist, and your network connection."
      );
    }
    if (error.name === "MongoServerError" && error.code === 18) {
      throw new Error(
        "MongoDB rejected the database credentials. Check the database username/password in MONGO_URI and URL-encode special characters."
      );
    }
    if (error.name === "MongoServerError" && error.code === 13) {
      throw new Error(
        "The MongoDB user lacks permission to update users in this database."
      );
    }
    if (error.name === "ValidationError") {
      throw new Error(`The database rejected the update: ${error.message}`);
    }
    throw new Error(
      `Database operation failed (${error.name || "unknown error"}${error.code ? `, code ${error.code}` : ""}). Check the MongoDB settings and database permissions.`
    );
  }

  console.log("Admin password reset successfully. Authenticator settings were preserved.");
};

resetAdminPassword()
  .catch((error) => {
    console.error(`Password reset failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
