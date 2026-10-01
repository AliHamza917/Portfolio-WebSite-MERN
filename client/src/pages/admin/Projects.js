import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    liveLink: "",
    githubLink: "",
    image: "",
    featured: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("adminToken");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("/api/projects");
      setProjects(data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      techStack: formData.techStack
        ? formData.techStack.split(",").map((t) => t.trim())
        : [],
    };

    try {
      if (editingId) {
        await axios.put(`/api/projects/${editingId}`, payload, config);
        toast.success("Project updated");
      } else {
        await axios.post("/api/projects", payload, config);
        toast.success("Project created");
      }
      setFormData({
        title: "",
        description: "",
        techStack: "",
        liveLink: "",
        githubLink: "",
        image: "",
        featured: false,
      });
      setEditingId(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      techStack: project.techStack?.join(", ") || "",
      liveLink: project.liveLink || "",
      githubLink: project.githubLink || "",
      image: project.image || "",
      featured: project.featured || false,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`/api/projects/${id}`, config);
      toast.success("Project deleted");
      fetchProjects();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Projects</h1>

      {/* Form */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">{editingId ? "Edit Project" : "Add New Project"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="input input-bordered"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="techStack"
              placeholder="Tech Stack (comma separated)"
              className="input input-bordered"
              value={formData.techStack}
              onChange={handleChange}
            />
            <input
              type="text"
              name="liveLink"
              placeholder="Live Link"
              className="input input-bordered"
              value={formData.liveLink}
              onChange={handleChange}
            />
            <input
              type="text"
              name="githubLink"
              placeholder="GitHub Link"
              className="input input-bordered"
              value={formData.githubLink}
              onChange={handleChange}
            />
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              className="input input-bordered md:col-span-2"
              value={formData.image}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              className="textarea textarea-bordered md:col-span-2"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
            <label className="label cursor-pointer gap-2">
              <span className="label-text">Featured</span>
              <input
                type="checkbox"
                name="featured"
                className="checkbox"
                checked={formData.featured}
                onChange={handleChange}
              />
            </label>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "",
                      description: "",
                      techStack: "",
                      liveLink: "",
                      githubLink: "",
                      image: "",
                      featured: false,
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Tech</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.techStack?.join(", ")}</td>
                <td className="flex gap-2">
                  <button className="btn btn-sm btn-info" onClick={() => handleEdit(p)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-error" onClick={() => handleDelete(p._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProjects;
