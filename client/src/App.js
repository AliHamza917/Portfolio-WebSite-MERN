import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./global/layouts/MainLayout";
import AdminLayout from "./global/layouts/AdminLayout";
import PrivateRoute from "./global/components/PrivateRoute";

// Lazy-load pages for code splitting (faster initial load)
const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const AdminSkills = lazy(() => import("./pages/admin/Skills"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const ChangePassword = lazy(() => import("./pages/admin/ChangePassword"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Portfolio */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Auth */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
