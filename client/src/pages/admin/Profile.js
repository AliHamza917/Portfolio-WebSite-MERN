import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    about: "",
    email: "",
    phone: "",
    location: "",
    profilePhoto: "",
    resumeLink: "",
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      website: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("adminToken");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/profile");
        setFormData({
          name: data.name || "",
          title: data.title || "",
          about: data.about || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          profilePhoto: data.profilePhoto || "",
          resumeLink: data.resumeLink || "",
          socialLinks: data.socialLinks || {
            github: "",
            linkedin: "",
            twitter: "",
            instagram: "",
            website: "",
          },
        });
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const key = name.replace("social_", "");
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [key]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/api/profile", formData, config);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="input input-bordered"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="title"
            placeholder="Title / Role"
            className="input input-bordered"
            value={formData.title}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="input input-bordered"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="input input-bordered"
            value={formData.location}
            onChange={handleChange}
          />
          <input
            type="text"
            name="profilePhoto"
            placeholder="Profile Photo URL"
            className="input input-bordered"
            value={formData.profilePhoto}
            onChange={handleChange}
          />
          <input
            type="text"
            name="resumeLink"
            placeholder="Resume Link"
            className="input input-bordered md:col-span-2"
            value={formData.resumeLink}
            onChange={handleChange}
          />
          <textarea
            name="about"
            placeholder="About Me"
            className="textarea textarea-bordered md:col-span-2 h-32"
            value={formData.about}
            onChange={handleChange}
          ></textarea>

          <h3 className="md:col-span-2 font-bold mt-4">Social Links</h3>
          <input
            type="text"
            name="social_github"
            placeholder="GitHub URL"
            className="input input-bordered"
            value={formData.socialLinks.github}
            onChange={handleChange}
          />
          <input
            type="text"
            name="social_linkedin"
            placeholder="LinkedIn URL"
            className="input input-bordered"
            value={formData.socialLinks.linkedin}
            onChange={handleChange}
          />
          <input
            type="text"
            name="social_twitter"
            placeholder="Twitter URL"
            className="input input-bordered"
            value={formData.socialLinks.twitter}
            onChange={handleChange}
          />
          <input
            type="text"
            name="social_instagram"
            placeholder="Instagram URL"
            className="input input-bordered"
            value={formData.socialLinks.instagram}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProfile;
