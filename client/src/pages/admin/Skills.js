import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "Frontend",
    level: 70,
  });
  const [editingId, setEditingId] = useState(null);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthConfig();
      if (editingId) {
        await axios.put(`/api/skills/${editingId}`, formData, config);
        toast.success("Skill updated");
      } else {
        await axios.post("/api/skills", formData, config);
        toast.success("Skill created");
      }
      setFormData({ name: "", category: "Frontend", level: 70 });
      setEditingId(null);
      fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
    });
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Skills</h1>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">{editingId ? "Edit Skill" : "Add Skill"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <input
              type="text"
              name="name"
              placeholder="Skill Name"
              className="input input-bordered"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <select
              name="category"
              className="select select-bordered"
              value={formData.category}
              onChange={handleChange}
            >
              <option>Frontend</option>
              <option>Backend</option>
              <option>Database</option>
              <option>Tools</option>
              <option>Other</option>
            </select>
            <input
              type="number"
              name="level"
              min="0"
              max="100"
              className="input input-bordered w-24"
              value={formData.level}
              onChange={handleChange}
            />
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", category: "Frontend", level: 70 });
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.level}%</td>
                <td className="flex gap-2">
                  <button className="btn btn-sm btn-info" onClick={() => handleEdit(s)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-error" onClick={() => handleDelete(s._id)}>
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

export default AdminSkills;
