const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { randomBytes } = require("crypto");
const User = require("../models/user-model");
const {
  createAuthenticatorQrCode,
  createAuthenticatorSecret,
  createRecoveryCodes,
  decryptSecret,
  encryptSecret,
  hashChallengeToken,
  hashRecoveryCode,
  verifyAuthenticatorCode,
} = require("../utills/two-factor");
const {
  validateJwtSecret,
  isValidEmail,
  isValidName,
  validatePasswordStrength,
} = require("../utills/auth-validator");

// Dummy hash used for constant-time comparison when email is not found
const DUMMY_HASH =
  "$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/k0g24zW2w6c0g9B4K9hB.Mh38qma";

// Generate JWT with validation
const generateToken = (id, mfaVerified = false) => {
  const secretValidation = validateJwtSecret();
  if (!secretValidation.valid) {
    throw new Error(secretValidation.message);
  }

  return jwt.sign(
    { id, ...(mfaVerified ? { mfa: true } : {}) },
    secretValidation.secret,
    {
      expiresIn: "30d",
    }
  );
};

const getUserWithTwoFactorSecrets = (id) =>
  User.findById(id).select(
    "+twoFactorSecret +pendingTwoFactorSecret +pendingTwoFactorExpiresAt +recoveryCodeHashes +lastTotpTimeStep +mfaChallengeHash +mfaChallengeExpiresAt"
  );

const respondWithLogin = (res, user, mfaVerified = false) =>
  res.status(200).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, mfaVerified),
  });

const consumeSecondFactor = async (user, token, options = {}) => {
  const { extraFilter = {}, set = {}, unset = {} } = options;
  const lastTimeStep = Number.isSafeInteger(user.lastTotpTimeStep)
    ? user.lastTotpTimeStep
    : -1;
  const recoveryCodeHash = hashRecoveryCode(token);
  const canUseRecoveryCode = user.recoveryCodeHashes?.includes(recoveryCodeHash);
  let update;

  if (typeof token === "string" && /^\d{6}$/.test(token)) {
    if (!user.twoFactorSecret) return false;

    const verification = await verifyAuthenticatorCode(
      decryptSecret(user.twoFactorSecret),
      token,
      lastTimeStep
    );
    if (!verification.valid) return false;

    const setValues = { ...set };
    if (!Object.prototype.hasOwnProperty.call(unset, "lastTotpTimeStep")) {
      setValues.lastTotpTimeStep = verification.timeStep;
    }
    update = {
      ...(Object.keys(setValues).length ? { $set: setValues } : {}),
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    };

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        ...extraFilter,
        $or: [
          { lastTotpTimeStep: lastTimeStep },
          ...(lastTimeStep === -1
            ? [{ lastTotpTimeStep: { $exists: false } }]
            : []),
        ],
      },
      update,
      { new: false }
    );
    return Boolean(updatedUser);
  }

  if (!canUseRecoveryCode) return false;
  update = {
    ...(!Object.prototype.hasOwnProperty.call(unset, "recoveryCodeHashes")
      ? { $pull: { recoveryCodeHashes: recoveryCodeHash } }
      : {}),
    ...(Object.keys(set).length ? { $set: set } : {}),
    ...(Object.keys(unset).length ? { $unset: unset } : {}),
  };

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      ...extraFilter,
      recoveryCodeHashes: recoveryCodeHash,
    },
    update,
    { new: false }
  );
  return Boolean(updatedUser);
};

// @desc    Register new admin
// @route   POST /api/auth/register
// @access  Public ONLY while no admin exists (first-time setup). Locked afterwards.
const registerUser = asyncHandler(async (req, res) => {
  // Check if an admin account already exists
  const count = await User.countDocuments();
  if (count > 0) {
    return res.status(403).json({
      message: "Registration is closed. An admin already exists.",
    });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are all required",
    });
  }

  // Validate name
  if (!isValidName(name)) {
    return res.status(400).json({
      message: "Please enter a valid name (2 to 70 characters without control characters)",
    });
  }

  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      message: passwordValidation.message,
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user exists (use generic response to avoid enumeration)
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    return res.status(400).json({
      message: "Unable to complete registration with the provided details",
    });
  }

  // Create first admin user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "admin",
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({
      message: "Invalid user data provided",
    });
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fail quickly on missing or non-string inputs
  if (
    !email ||
    typeof email !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      message: "Please provide both email and password",
    });
  }

  // Basic length sanity check to prevent bcrypt payload exhaustion
  if (password.length > 128) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // If email format is invalid, return generic message without querying DB
  if (!isValidEmail(email)) {
    // Perform dummy comparison to keep response time consistent
    await bcrypt.compare(password, DUMMY_HASH);
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Timing attack mitigation: perform fake bcrypt compare when user not found
    await bcrypt.compare(password, DUMMY_HASH);
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // Ensure only admin users can access the system
  if (user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Account does not have admin privileges",
    });
  }

  if (user.twoFactorEnabled) {
    const challengeToken = randomBytes(32).toString("base64url");
    user.mfaChallengeHash = hashChallengeToken(challengeToken);
    user.mfaChallengeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    return res.status(200).json({
      requiresTwoFactor: true,
      challengeToken,
    });
  }

  return respondWithLogin(res, user);
});

// @desc    Verify the authenticator code after password login
// @route   POST /api/auth/login/totp
// @access  Public with short-lived challenge
const verifyLoginTwoFactor = asyncHandler(async (req, res) => {
  const { challengeToken, code } = req.body;
  if (
    typeof challengeToken !== "string" ||
    challengeToken.length > 100 ||
    typeof code !== "string" ||
    code.length > 64
  ) {
    return res.status(400).json({ message: "A valid challenge and code are required" });
  }

  const challengeHash = hashChallengeToken(challengeToken);
  const user = await User.findOne({
    mfaChallengeHash: challengeHash,
    mfaChallengeExpiresAt: { $gt: new Date() },
    twoFactorEnabled: true,
    role: "admin",
  }).select(
    "+twoFactorSecret +recoveryCodeHashes +lastTotpTimeStep +mfaChallengeHash +mfaChallengeExpiresAt"
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid or expired authentication challenge" });
  }

  const verified = await consumeSecondFactor(user, code, {
    extraFilter: {
      mfaChallengeHash: challengeHash,
      mfaChallengeExpiresAt: { $gt: new Date() },
      twoFactorEnabled: true,
    },
    unset: {
      mfaChallengeHash: 1,
      mfaChallengeExpiresAt: 1,
    },
  });

  if (!verified) {
    return res.status(401).json({ message: "Invalid or expired authenticator code" });
  }

  return respondWithLogin(res, user, true);
});

// @desc    Get authenticator status
// @route   GET /api/auth/totp/status
// @access  Private
const getTwoFactorStatus = asyncHandler(async (req, res) => {
  res.status(200).json({ enabled: Boolean(req.user.twoFactorEnabled) });
});

// @desc    Create a pending authenticator setup
// @route   POST /api/auth/totp/setup
// @access  Private
const setupTwoFactor = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (
    typeof password !== "string" ||
    !password ||
    password.length > 128
  ) {
    return res.status(400).json({ message: "Current password is required" });
  }

  const user = await getUserWithTwoFactorSecrets(req.user._id);
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  if (user.twoFactorEnabled) {
    return res.status(409).json({ message: "Authenticator login is already enabled" });
  }

  const secret = createAuthenticatorSecret();
  const qrCode = await createAuthenticatorQrCode(user.email, secret);
  user.pendingTwoFactorSecret = encryptSecret(secret);
  user.pendingTwoFactorExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  res.status(200).json({
    qrCode,
    expiresInSeconds: 600,
  });
});

// @desc    Confirm authenticator setup and generate one-time recovery codes
// @route   POST /api/auth/totp/enable
// @access  Private
const enableTwoFactor = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string") {
    return res.status(400).json({ message: "An authenticator code is required" });
  }

  const user = await getUserWithTwoFactorSecrets(req.user._id);
  if (!user || user.twoFactorEnabled) {
    return res.status(409).json({ message: "Authenticator setup is not available" });
  }
  if (
    !user.pendingTwoFactorSecret ||
    !user.pendingTwoFactorExpiresAt ||
    user.pendingTwoFactorExpiresAt <= new Date()
  ) {
    return res.status(400).json({ message: "Authenticator setup expired. Start setup again." });
  }

  const secret = decryptSecret(user.pendingTwoFactorSecret);
  const verification = await verifyAuthenticatorCode(secret, code);
  if (!verification.valid) {
    return res.status(401).json({ message: "Invalid authenticator code" });
  }

  const recoveryCodes = createRecoveryCodes();
  const enabledUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      twoFactorEnabled: { $ne: true },
      pendingTwoFactorSecret: user.pendingTwoFactorSecret,
      pendingTwoFactorExpiresAt: { $gt: new Date() },
    },
    {
      $set: {
        twoFactorEnabled: true,
        twoFactorSecret: user.pendingTwoFactorSecret,
        lastTotpTimeStep: verification.timeStep,
        recoveryCodeHashes: recoveryCodes.map(hashRecoveryCode),
      },
      $unset: {
        pendingTwoFactorSecret: 1,
        pendingTwoFactorExpiresAt: 1,
      },
    },
    { new: true }
  );

  if (!enabledUser) {
    return res.status(409).json({ message: "Authenticator setup expired. Start setup again." });
  }

  res.status(200).json({
    enabled: true,
    recoveryCodes,
    token: generateToken(enabledUser._id, true),
    message: "Authenticator login enabled. Save these recovery codes somewhere safe.",
  });
});

// @desc    Disable authenticator login
// @route   POST /api/auth/totp/disable
// @access  Private
const disableTwoFactor = asyncHandler(async (req, res) => {
  const { password, code } = req.body;
  if (
    typeof password !== "string" ||
    !password ||
    password.length > 128 ||
    typeof code !== "string" ||
    code.length > 64
  ) {
    return res.status(400).json({ message: "Current password and authenticator or recovery code are required" });
  }

  const user = await getUserWithTwoFactorSecrets(req.user._id);
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  if (!user.twoFactorEnabled) {
    return res.status(409).json({ message: "Authenticator login is not enabled" });
  }

  const verified = await consumeSecondFactor(user, code, {
    extraFilter: { twoFactorEnabled: true },
    unset: {
      twoFactorEnabled: 1,
      twoFactorSecret: 1,
      pendingTwoFactorSecret: 1,
      pendingTwoFactorExpiresAt: 1,
      recoveryCodeHashes: 1,
      lastTotpTimeStep: 1,
      mfaChallengeHash: 1,
      mfaChallengeExpiresAt: 1,
    },
  });
  if (!verified) {
    return res.status(401).json({ message: "Invalid authenticator or recovery code" });
  }

  res.status(200).json({ enabled: false, message: "Authenticator login disabled" });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (
    !currentPassword ||
    typeof currentPassword !== "string" ||
    !newPassword ||
    typeof newPassword !== "string"
  ) {
    return res.status(400).json({
      message: "Please provide both current and new password",
    });
  }

  // Check new password policy
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      message: passwordValidation.message,
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: "New password must be different from current password",
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }

  // Securely update only the password field
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    message: "Password updated successfully",
  });
});

module.exports = {
  registerUser,
  loginUser,
  verifyLoginTwoFactor,
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  getMe,
  changePassword,
};
