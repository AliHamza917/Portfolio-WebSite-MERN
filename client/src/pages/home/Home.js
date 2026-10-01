import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, projectsRes, skillsRes] = await Promise.all([
          axios.get("/api/profile"),
          axios.get("/api/projects"),
          axios.get("/api/skills"),
        ]);
        setProfile(profileRes.data);
        setProjects(projectsRes.data);
        setSkills(skillsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/contact", formData);
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="hero min-h-[80vh] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            {profile?.profilePhoto && (
              <div className="avatar mb-6">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={profile.profilePhoto} alt={profile.name} />
                </div>
              </div>
            )}
            <h1 className="text-5xl font-bold">
              Hi, I'm {profile?.name || "Ali Hamza"}
            </h1>
            <p className="py-6 text-xl">{profile?.title || "MERN Stack Developer"}</p>
            <p className="mb-6 opacity-80">
              {profile?.about?.substring(0, 150) ||
                "Passionate full-stack developer specializing in the MERN stack."}
              ...
            </p>
            <div className="flex gap-4 justify-center">
              <a href="#projects" className="btn btn-primary">
                View Projects
              </a>
              <a href="#contact" className="btn btn-outline">
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-base-100">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-10">About Me</h2>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <p className="text-lg leading-relaxed">
                {profile?.about ||
                  "Passionate full-stack developer specializing in the MERN stack. I love building modern, scalable web applications."}
              </p>
              {profile?.location && (
                <p className="mt-4">
                  <strong>Location:</strong> {profile.location}
                </p>
              )}
              {profile?.email && (
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 bg-base-200">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-10">Skills</h2>
          {skills.length === 0 ? (
            <p className="text-center opacity-70">No skills added yet. Add them from the Admin Panel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <div key={skill._id} className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <h3 className="card-title">{skill.name}</h3>
                    <p className="text-sm opacity-70">{skill.category}</p>
                    <progress
                      className="progress progress-primary w-full"
                      value={skill.level}
                      max="100"
                    ></progress>
                    <span className="text-sm">{skill.level}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 bg-base-100">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-10">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-center opacity-70">No projects yet. Add them from the Admin Panel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project._id} className="card bg-base-200 shadow-xl">
                  {project.image && (
                    <figure>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-48 w-full object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h3 className="card-title">{project.title}</h3>
                    <p className="text-sm line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 my-2">
                      {project.techStack?.map((tech, i) => (
                        <span key={i} className="badge badge-outline badge-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="card-actions justify-end">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          <FaGithub /> Code
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <FaExternalLinkAlt /> Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-base-200">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-4xl font-bold text-center mb-10">Contact Me</h2>
          <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
            <div className="card-body gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                className="input input-bordered w-full"
                value={formData.subject}
                onChange={handleChange}
              />
              <textarea
                name="message"
                placeholder="Your Message"
                className="textarea textarea-bordered w-full h-32"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
