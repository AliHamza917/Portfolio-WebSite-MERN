/**
 * Authentication and input validation helper utilities
 */

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 70;
const MIN_SECRET_LENGTH = 16; // minimum acceptable secret length; 32+ recommended for production

/**
 * Validates whether the environment contains a secure JWT secret
 */
const validateJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string") {
    return {
      valid: false,
      message: "JWT_SECRET environment variable is missing or empty",
    };
  }

  const trimmed = secret.trim();
  if (trimmed.length < MIN_SECRET_LENGTH) {
    return {
      valid: false,
      message: `JWT_SECRET is too weak (must be at least ${MIN_SECRET_LENGTH} characters long)`,
    };
  }

  // Reject placeholder values commonly copied from .env.example
  const defaultPlaceholders = [
    "put_a_long_random_text_here",
    "your_jwt_secret_key",
    "your_super_secret_jwt_key_here_change_this",
    "secret",
    "jwt_secret",
    "change_this",
    "12345678",
  ];

  if (defaultPlaceholders.includes(trimmed.toLowerCase())) {
    return {
      valid: false,
      message: "JWT_SECRET is using a default placeholder value and must be changed",
    };
  }

  return { valid: true, secret: trimmed };
};

/**
 * Validates JWT format (header.payload.signature)
 */
const isValidJwtFormat = (token) => {
  if (typeof token !== "string") return false;
  const trimmed = token.trim();
  // Standard Base64URL string in three parts
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed);
};

/**
 * Validates email format according to standard RFC 5322 pattern
 */
const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
};

/**
 * Validates name length and safe characters
 */
const isValidName = (name) => {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < MIN_NAME_LENGTH || trimmed.length > MAX_NAME_LENGTH) {
    return false;
  }
  // Disallow ASCII control characters
  return !/[\x00-\x1F\x7F]/.test(trimmed);
};

/**
 * Validates password strength:
 * - 8 to 128 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 */
const validatePasswordStrength = (password) => {
  if (typeof password !== "string") {
    return { valid: false, message: "Password must be a string" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`,
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLower || !hasUpper || !hasNumber) {
    return {
      valid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  return { valid: true };
};

module.exports = {
  validateJwtSecret,
  isValidJwtFormat,
  isValidEmail,
  isValidName,
  validatePasswordStrength,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
};
