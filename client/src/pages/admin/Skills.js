import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowUp, FaArrowDown, FaSearch } from "react-icons/fa";

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "Frontend",
    level: 70,
    order: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const getAuthConfig = () => {
    const token = localStorage.getItem("adminToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchSkills = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/skills");
      setSkills(data);
    } catch (error) {
      toast.error("Failed to fetch skills");
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthConfig();
      const payload = {
        ...formData,
        order: Number(formData.order) || 0,
        level: Number(formData.level) || 70,
      };

      if (editingId) {
        await axios.put(`/api/skills/${editingId}`, payload, config);
        toast.success("Skill updated successfully");
      } else {
        await axios.post("/api/skills", payload, config);
        toast.success("Skill created successfully");
      }
      setFormData({ name: "", category: "Frontend", level: 70, order: 0 });
      setEditingId(null);
      fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      order: skill.order ?? 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await axios.delete(`/api/skills/${id}`, getAuthConfig());
      toast.success("Skill deleted");
      fetchSkills();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleQuickReorder = async (skill, delta) => {
    const newOrder = Math.max(0, (skill.order ?? 0) + delta);
    try {
      await axios.put(
        `/api/skills/${skill._id}`,
        { ...skill, order: newOrder },
        getAuthConfig()
      );
      toast.success(`Updated order to #${newOrder}`);
      fetchSkills();
    } catch (error) {
      toast.error("Failed to reorder skill");
    }
  };

  const filteredList = useMemo(() => {
    return skills.filter((s) => {
      const matchCat =
        filterCategory === "All" ||
        s.category?.toLowerCase() === filterCategory.toLowerCase();
      const matchSearch = s.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [skills, filterCategory, searchTerm]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manage & Arrange Skills</h1>
        <p className="text-sm opacity-70">
          Add, categorize, and arrange the proficiency and display order of your technical skills.
        </p>
      </div>

      {/* Form Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-xl text-primary font-bold">
            {editingId ? "Edit Skill" : "Add New Skill"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <label className="label text-xs font-semibold">Skill Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. React, MongoDB"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">Category</label>
              <select
                name="category"
                className="select select-bordered w-full"
                value={formData.category}
                onChange={handleChange}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Database</option>
                <option>Tools</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="label text-xs font-semibold">Proficiency Level (0-100%)</label>
              <input
                type="number"
                name="level"
                min="0"
                max="100"
                className="input input-bordered w-full"
                value={formData.level}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">Display Order</label>
              <input
                type="number"
                name="order"
                placeholder="0, 1, 2..."
                className="input input-bordered w-full"
                value={formData.order}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", category: "Frontend", level: 70, order: 0 });
                  }}
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary px-8">
                {editingId ? "Update Skill" : "Add Skill"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Skills List Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            {/* Filter by Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {["All", "Frontend", "Backend", "Database", "Tools", "Other"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`btn btn-xs rounded-full ${
                      filterCategory === cat
                        ? "btn-primary shadow-sm"
                        : "btn-ghost bg-base-200"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-xs" />
              <input
                type="text"
                placeholder="Search skills..."
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
                  <th>Skill Name</th>
                  <th>Category</th>
                  <th>Proficiency</th>
                  <th className="w-24 text-center">Reorder</th>
                  <th className="w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <span className="badge badge-neutral font-mono font-bold">
                        #{s.order ?? 0}
                      </span>
                    </td>
                    <td className="font-bold">{s.name}</td>
                    <td>
                      <span className="badge badge-outline badge-sm">
                        {s.category}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 max-w-xs">
                        <progress
                          className="progress progress-primary w-24"
                          value={s.level}
                          max="100"
                        ></progress>
                        <span className="font-medium text-xs">{s.level}%</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="join">
                        <button
                          onClick={() => handleQuickReorder(s, -1)}
                          className="join-item btn btn-xs btn-ghost"
                          title="Move Up (Decrease Order)"
                        >
                          <FaArrowUp className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleQuickReorder(s, +1)}
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
                          onClick={() => handleEdit(s)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleDelete(s._id)}
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

export default AdminSkills;
