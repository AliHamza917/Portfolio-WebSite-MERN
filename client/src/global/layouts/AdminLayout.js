import { Outlet, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-300 shadow-lg">
        <div className="flex-1">
          <Link to="/admin" className="btn btn-ghost text-xl">
            Admin Panel
          </Link>
        </div>
        <div className="flex-none gap-2">
          <Link to="/" className="btn btn-ghost btn-sm">
            View Site
          </Link>
          <button onClick={handleLogout} className="btn btn-error btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-64px)] bg-base-300 p-4">
          <ul className="menu menu-vertical gap-1">
            <li>
              <Link to="/admin">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/projects">Projects</Link>
            </li>
            <li>
              <Link to="/admin/skills">Skills</Link>
            </li>
            <li>
              <Link to="/admin/messages">Messages</Link>
            </li>
            <li>
              <Link to="/admin/profile">Profile</Link>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
