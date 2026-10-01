import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    messages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [projects, skills, messages] = await Promise.all([
          axios.get("/api/projects"),
          axios.get("/api/skills"),
          axios.get("/api/contact", config),
        ]);

        setStats({
          projects: projects.data.length,
          skills: skills.data.length,
          messages: messages.data.length,
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-title">Projects</div>
          <div className="stat-value text-primary">{stats.projects}</div>
          <div className="stat-actions">
            <Link to="/admin/projects" className="btn btn-sm btn-primary">
              Manage
            </Link>
          </div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-title">Skills</div>
          <div className="stat-value text-secondary">{stats.skills}</div>
          <div className="stat-actions">
            <Link to="/admin/skills" className="btn btn-sm btn-secondary">
              Manage
            </Link>
          </div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-title">Messages</div>
          <div className="stat-value text-accent">{stats.messages}</div>
          <div className="stat-actions">
            <Link to="/admin/messages" className="btn btn-sm btn-accent">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
