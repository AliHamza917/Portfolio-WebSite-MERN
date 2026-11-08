const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 70,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
    sessionVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    pendingTwoFactorSecret: {
      type: String,
      select: false,
    },
    pendingTwoFactorExpiresAt: {
      type: Date,
      select: false,
    },
    recoveryCodeHashes: {
      type: [String],
      select: false,
      default: [],
    },
    lastTotpTimeStep: {
      type: Number,
      select: false,
      default: -1,
    },
    mfaChallengeHash: {
      type: String,
      select: false,
    },
    mfaChallengeExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (typeof enteredPassword !== "string") return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
