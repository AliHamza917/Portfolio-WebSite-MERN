import { Routes, Route } from "react-router-dom";
import MainLayout from "./global/layouts/MainLayout";
import AdminLayout from "./global/layouts/AdminLayout";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import AdminSkills from "./pages/admin/Skills";
import AdminMessages from "./pages/admin/Messages";
import AdminProfile from "./pages/admin/Profile";
import PrivateRoute from "./global/components/PrivateRoute";

function App() {
  return (
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
      </Route>
    </Routes>
  );
}

export default App;
