import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
});

const TwoFactorAuth = () => {
  const [enabled, setEnabled] = useState(false);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    axios
      .get("/api/auth/totp/status", getAuthConfig())
      .then(({ data }) => {
        if (active) setEnabled(data.enabled);
      })
      .catch((error) => {
        if (active) {
          toast.error(
            error.response?.data?.message ||
              "Could not load authenticator status"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const beginSetup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        "/api/auth/totp/setup",
        { password },
        getAuthConfig()
      );
      setSetup(data);
      setPassword("");
      setCode("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not start authenticator setup"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const enableAuthenticator = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        "/api/auth/totp/enable",
        { code: code.trim() },
        getAuthConfig()
      );
      localStorage.setItem("adminToken", data.token);
      setEnabled(true);
      setSetup(null);
      setCode("");
      setRecoveryCodes(data.recoveryCodes);
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not verify authenticator code"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const disableAuthenticator = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        "/api/auth/totp/disable",
        { password, code: code.trim() },
        getAuthConfig()
      );
      setEnabled(false);
      setCode("");
      setPassword("");
      setRecoveryCodes([]);
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not disable authenticator login"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <span className="loading loading-spinner loading-sm text-primary" />
        </div>
      </div>
    );
  }

  return (
    <section className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body space-y-4">
        <div>
          <h2 className="card-title">Authenticator App</h2>
          <p className="text-sm opacity-70">
            Add a time-based verification code from Google Authenticator or
            another compatible app to admin sign-in.
          </p>
        </div>

        {recoveryCodes.length > 0 && (
          <div className="alert alert-warning">
            <div>
              <p className="font-semibold">Save these recovery codes now.</p>
              <p className="text-sm">
                Each code works once. They will not be shown again.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">
                {recoveryCodes.map((recoveryCode) => (
                  <code key={recoveryCode}>{recoveryCode}</code>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-sm mt-3"
                onClick={() => setRecoveryCodes([])}
              >
                I saved these codes
              </button>
            </div>
          </div>
        )}

        {enabled ? (
          <form onSubmit={disableAuthenticator} className="space-y-3">
            <p className="text-sm text-success">
              Authenticator login is enabled.
            </p>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Current password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Authenticator code or recovery code"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-error"
              disabled={submitting}
            >
              {submitting ? "Disabling..." : "Disable authenticator login"}
            </button>
          </form>
        ) : setup ? (
          <form onSubmit={enableAuthenticator} className="space-y-3">
            <p className="text-sm">
              Scan this QR code with Google Authenticator or another TOTP app.
              Enter the generated six-digit code to confirm setup.
            </p>
            <img
              src={setup.qrCode}
              alt="Authenticator setup QR code"
              className="w-64 max-w-full rounded-lg border border-base-300 bg-white p-2"
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              className="input input-bordered w-full"
              placeholder="6-digit authenticator code"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Enable authenticator login"}
            </button>
          </form>
        ) : (
          <form onSubmit={beginSetup} className="space-y-3">
            <p className="text-sm">
              Verify your password to begin setting up two-factor
              authentication.
            </p>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Current password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Starting setup..." : "Set up authenticator"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default TwoFactorAuth;
