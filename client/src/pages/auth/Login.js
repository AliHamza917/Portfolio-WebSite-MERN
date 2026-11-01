import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import ThemeToggle from "../../global/components/ThemeToggle";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [challengeToken, setChallengeToken] = useState("");
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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
          <h2 className="card-title text-2xl justify-center mb-2 font-bold text-primary">
            Admin Login
          </h2>
          <p className="text-center text-xs opacity-60 mb-4">
            {challengeToken
              ? "Enter the code from your authenticator app or a recovery code"
              : "Enter your credentials to access the portfolio dashboard"}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="input input-bordered w-full"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </>
            )}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : challengeToken
                  ? "Verify code"
                  : "Login"}
            </button>
            {challengeToken && (
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => {
                  setChallengeToken("");
                  setAuthenticatorCode("");
                }}
                disabled={loading}
              >
                Back to password
              </button>
            )}
          </form>
          <p className="text-center text-sm mt-4 opacity-70">
            Admin access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
