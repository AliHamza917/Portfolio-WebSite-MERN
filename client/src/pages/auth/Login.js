import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeft, FaUserShield, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import ThemeToggle from "../../global/components/ThemeToggle";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [challengeToken, setChallengeToken] = useState("");
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const navigate = useNavigate();

  // Check whether first-time setup is needed
  useEffect(() => {
    let active = true;
    const checkSetupStatus = async () => {
      try {
        const { data } = await axios.get("/api/auth/setup-status");
        if (active && data.needsSetup) {
          setNeedsSetup(true);
          setIsSetupMode(true);
        }
      } catch (err) {
        // If endpoint is not reachable or fails, fallback to normal login
        console.warn("Could not check setup status:", err.message);
      } finally {
        if (active) setCheckingStatus(false);
      }
    };
    checkSetupStatus();
    return () => {
      active = false;
    };
  }, []);

  const handleLoginChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // First-time admin creation
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (registerData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", {
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
      });

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data));
      toast.success("Administrator account created successfully! Welcome.");
      navigate("/admin");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create administrator account"
      );
    } finally {
      setLoading(false);
    }
  };

  // Standard login + 2FA challenge
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = challengeToken
        ? await axios.post("/api/auth/login/totp", {
            challengeToken,
            code: authenticatorCode.trim(),
          })
        : await axios.post("/api/auth/login", formData);

      if (data.requiresTwoFactor) {
        setChallengeToken(data.challengeToken);
        toast.info("Enter your authenticator code to finish signing in.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data));
      toast.success("Login successful!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8 relative">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl transition-all duration-300 border border-base-300">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span>Back to Website</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* First-time setup banner */}
          {needsSetup && !checkingStatus && (
            <div className="alert alert-info text-xs py-2 mb-3 shadow-sm flex items-center gap-2">
              <FaUserShield className="text-base flex-shrink-0" />
              <span>
                <strong>First-time setup detected:</strong> No admin exists in the database. Please create your administrator account.
              </span>
            </div>
          )}

          <h2 className="card-title text-2xl justify-center mb-1 font-bold text-primary flex items-center gap-2">
            {isSetupMode ? (
              <>
                <FaUserPlus className="text-xl" /> Create Admin Account
              </>
            ) : (
              <>
                <FaSignInAlt className="text-xl" /> Admin Login
              </>
            )}
          </h2>

          <p className="text-center text-xs opacity-70 mb-4">
            {isSetupMode
              ? "Set up your initial administrator credentials to manage your portfolio."
              : challengeToken
                ? "Enter the code from your Google Authenticator app or a recovery code."
                : "Enter your credentials to access the portfolio dashboard."}
          </p>

          {isSetupMode ? (
            /* First-Time Setup Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Ali Hamza"
                  className="input input-bordered w-full input-sm sm:input-md"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold">Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. admin@example.com"
                  className="input input-bordered w-full input-sm sm:input-md"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                  className="input input-bordered w-full input-sm sm:input-md"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold">Confirm Password</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  className="input input-bordered w-full input-sm sm:input-md"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-2 shadow-md hover:scale-[1.01] transition-transform"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Admin & Sign In"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  className="btn btn-link btn-xs text-xs opacity-70 hover:opacity-100"
                  onClick={() => setIsSetupMode(false)}
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {challengeToken ? (
                <input
                  type="text"
                  name="authenticatorCode"
                  placeholder="6-digit code or recovery code"
                  className="input input-bordered w-full"
                  value={authenticatorCode}
                  onChange={(event) => setAuthenticatorCode(event.target.value)}
                  autoComplete="one-time-code"
                  autoFocus
                  required
                />
              ) : (
                <>
                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-semibold">Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="admin@example.com"
                      className="input input-bordered w-full"
                      value={formData.email}
                      onChange={handleLoginChange}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-semibold">Password</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      className="input input-bordered w-full"
                      value={formData.password}
                      onChange={handleLoginChange}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full shadow-md hover:scale-[1.01] transition-transform"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : challengeToken
                    ? "Verify Code"
                    : "Sign In"}
              </button>

              {challengeToken && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm w-full"
                  onClick={() => {
                    setChallengeToken("");
                    setAuthenticatorCode("");
                  }}
                  disabled={loading}
                >
                  Back to password
                </button>
              )}

              {needsSetup && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    className="btn btn-link btn-xs text-xs text-info"
                    onClick={() => setIsSetupMode(true)}
                  >
                    Need first-time setup? Create Admin Account
                  </button>
                </div>
              )}
            </form>
          )}

          <p className="text-center text-xs mt-4 opacity-50">
            Protected Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
