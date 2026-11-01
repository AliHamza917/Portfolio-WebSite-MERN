const {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} = require("crypto");
const { generateSecret, generateURI, verify } = require("otplib");
const QRCode = require("qrcode");

const getEncryptionKey = () => {
  const configuredKey = process.env.TOTP_ENCRYPTION_KEY?.trim();
  if (!configuredKey) {
    throw new Error("TOTP_ENCRYPTION_KEY must be configured to use authenticator login");
  }

  if (/^[\da-f]{64}$/i.test(configuredKey)) {
    return Buffer.from(configuredKey, "hex");
  }

  const key = Buffer.from(configuredKey, "base64");
  if (key.length !== 32 || key.toString("base64") !== configuredKey) {
    throw new Error("TOTP_ENCRYPTION_KEY must be 32 bytes encoded as base64 or 64 hexadecimal characters");
  }

  return key;
};

const encryptSecret = (secret) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
};

const decryptSecret = (encryptedSecret) => {
  const [version, encodedIv, encodedTag, encodedCiphertext] =
    (encryptedSecret || "").split(".");
  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedTag ||
    !encodedCiphertext
  ) {
    throw new Error("Stored authenticator secret is invalid");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(encodedIv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

const createAuthenticatorSecret = () => generateSecret({ length: 20 });

const createAuthenticatorQrCode = async (email, secret) => {
  const uri = generateURI({
    issuer: "Portfolio Admin",
    label: email,
    secret,
  });
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
  });
};

const verifyAuthenticatorCode = async (secret, token, afterTimeStep = -1) => {
  if (typeof token !== "string" || !/^\d{6}$/.test(token)) {
    return { valid: false };
  }

  const options = {
    secret,
    token,
    epochTolerance: [30, 0],
  };
  if (Number.isSafeInteger(afterTimeStep) && afterTimeStep >= 0) {
    options.afterTimeStep = afterTimeStep;
  }

  return verify(options);
};

const createRecoveryCodes = (count = 10) =>
  Array.from({ length: count }, () => randomBytes(12).toString("hex"));

const hashRecoveryCode = (code) =>
  createHash("sha256").update(code.trim().toLowerCase()).digest("hex");

const hashChallengeToken = (token) =>
  createHash("sha256").update(token).digest("hex");

module.exports = {
  createAuthenticatorQrCode,
  createAuthenticatorSecret,
  createRecoveryCodes,
  decryptSecret,
  encryptSecret,
  hashChallengeToken,
  hashRecoveryCode,
  verifyAuthenticatorCode,
};
