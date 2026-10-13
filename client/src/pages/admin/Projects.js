import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowUp, FaArrowDown, FaStar, FaSearch } from "react-icons/fa";

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
    order: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("adminToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/projects");
      setProjects(data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      order: Number(formData.order) || 0,
      techStack: formData.techStack
        ? formData.techStack.split(",").map((t) => t.trim())
        : [],
    };

    try {
      const config = getAuthConfig();
      if (editingId) {
        await axios.put(`/api/projects/${editingId}`, payload, config);
        toast.success("Project updated successfully");
      } else {
        await axios.post("/api/projects", payload, config);
        toast.success("Project created successfully");
      }
      setFormData({
        title: "",
        description: "",
        techStack: "",
        liveLink: "",
        githubLink: "",
        image: "",
        featured: false,
        order: 0,
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
      order: project.order ?? 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`/api/projects/${id}`, getAuthConfig());
      toast.success("Project deleted");
      fetchProjects();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Quick reorder adjustment
  const handleQuickReorder = async (project, delta) => {
    const newOrder = Math.max(0, (project.order ?? 0) + delta);
    try {
      await axios.put(
        `/api/projects/${project._id}`,
        { ...project, order: newOrder },
        getAuthConfig()
      );
      toast.success(`Updated order to #${newOrder}`);
      fetchProjects();
    } catch (error) {
      toast.error("Failed to reorder project");
    }
  };

  const filteredList = useMemo(() => {
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.techStack?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manage & Arrange Projects</h1>
        <p className="text-sm opacity-70">
          Create, edit, and arrange the display order of your portfolio projects.
        </p>
      </div>

      {/* Form Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-xl text-primary font-bold">
            {editingId ? "Edit Project" : "Add New Project"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="label text-xs font-semibold">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Project Title"
                className="input input-bordered w-full"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">Display Order (Lower = First)</label>
              <input
                type="number"
                name="order"
                placeholder="0, 1, 2..."
                className="input input-bordered w-full"
                value={formData.order}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">Tech Stack (comma separated)</label>
              <input
                type="text"
                name="techStack"
                placeholder="React, Node.js, Express, MongoDB"
                className="input input-bordered w-full"
                value={formData.techStack}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">Live Preview Link</label>
              <input
                type="text"
                name="liveLink"
                placeholder="https://..."
                className="input input-bordered w-full"
                value={formData.liveLink}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">GitHub Repository Link</label>
              <input
                type="text"
                name="githubLink"
                placeholder="https://github.com/..."
                className="input input-bordered w-full"
                value={formData.githubLink}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">Image URL</label>
              <input
                type="text"
                name="image"
                placeholder="https://images.unsplash.com/..."
                className="input input-bordered w-full"
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label text-xs font-semibold">Description</label>
              <textarea
                name="description"
                placeholder="Detailed description of the project..."
                className="textarea textarea-bordered w-full h-24"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  className="checkbox checkbox-primary"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span className="label-text font-medium flex items-center gap-1">
                  <FaStar className="text-warning text-xs" /> Feature on top of portfolio
                </span>
              </label>

              <div className="flex gap-2">
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
                        order: 0,
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary px-6" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Project" : "Create Project"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Projects List Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <h2 className="card-title text-xl font-bold">
              All Projects ({projects.length})
            </h2>
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-xs" />
              <input
                type="text"
                placeholder="Filter by title or tech..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered input-sm w-full pl-8"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-sm">
              <thead>
                <tr>
                  <th className="w-16">Order</th>
                  <th>Title</th>
                  <th>Tech Stack</th>
                  <th className="w-24 text-center">Reorder</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="badge badge-neutral font-mono font-bold">
                        #{p.order ?? 0}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold flex items-center gap-1.5">
                        {p.title}
                        {p.featured && (
                          <FaStar className="text-warning text-xs" title="Featured" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.techStack?.map((t, i) => (
                          <span key={i} className="badge badge-xs badge-ghost">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="join">
                        <button
                          onClick={() => handleQuickReorder(p, -1)}
                          className="join-item btn btn-xs btn-ghost"
                          title="Move Up (Decrease Order)"
                        >
                          <FaArrowUp className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleQuickReorder(p, +1)}
                          className="join-item btn btn-xs btn-ghost"
                          title="Move Down (Increase Order)"
                        >
                          <FaArrowDown className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          className="btn btn-xs btn-info"
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleDelete(p._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
