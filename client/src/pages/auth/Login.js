import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", formData);
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
          </div>
          <h2 className="card-title text-2xl justify-center mb-2 font-bold text-primary">
            Admin Login
          </h2>
          <p className="text-center text-xs opacity-60 mb-4">
            Enter your credentials to access the portfolio dashboard
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
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
