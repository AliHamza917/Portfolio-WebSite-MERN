import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";
import axios from "axios";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const { data } = await axios.get("/api/contact/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(data.count || 0);
    } catch {
      // silent fail
    }
  }, []);

  // Fetch on mount + re-fetch when navigating away from messages page
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, location.pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Poll every 30 seconds for new messages
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: "🏠" },
    { to: "/admin/projects", label: "Projects", icon: "💼" },
    { to: "/admin/skills", label: "Skills", icon: "🛠️" },
    {
      to: "/admin/messages",
      label: "Messages",
      icon: "✉️",
      badge: unreadCount,
    },
    { to: "/admin/profile", label: "Profile", icon: "👤" },
    { to: "/admin/change-password", label: "Change Password", icon: "🔑" },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top Navbar */}
      <div className="navbar bg-base-300 shadow-lg px-4 sticky top-0 z-50">
        <div className="flex-none md:hidden mr-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-square btn-ghost btn-sm"
            aria-label="Toggle Navigation Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-5 h-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
        <div className="flex-1">
          <Link to="/admin" className="btn btn-ghost text-lg sm:text-xl font-bold tracking-wide">
            ⚙️ Admin Panel
          </Link>
        </div>
        <div className="flex-none gap-2 items-center">
          <ThemeToggle />
          <Link to="/" className="btn btn-ghost btn-sm">
            🌐 View Site
          </Link>
          <button onClick={handleLogout} className="btn btn-error btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="flex relative">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static top-16 bottom-0 left-0 z-40 w-64 bg-base-300 p-4 shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 min-h-[calc(100vh-64px)] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ul className="menu menu-vertical gap-1">
            {navItems.map(({ to, label, icon, badge }) => {
              const isActive =
                to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-2 rounded-lg transition-colors ${
                      isActive ? "bg-primary text-primary-content font-semibold" : ""
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="flex-1">{label}</span>
                    {badge > 0 && (
                      <span className="badge badge-error badge-sm font-bold animate-pulse">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto w-full max-w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
