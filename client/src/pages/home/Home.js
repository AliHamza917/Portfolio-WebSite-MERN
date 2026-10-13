import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaGithub, FaExternalLinkAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

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
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section id="home" className="hero min-h-[85vh] bg-base-200 py-16">
        <div className="hero-content text-center animate-fade-in-up">
          <div className="max-w-xl">
            {profile?.profilePhoto && (
              <div className="avatar mb-6 animate-float">
                <div className="w-36 rounded-full ring-4 ring-primary ring-offset-base-100 ring-offset-4 animate-pulse-glow shadow-xl">
                  <img src={profile.profilePhoto} alt={profile.name} />
                </div>
              </div>
            )}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-2">
              Hi, I'm <span className="gradient-text">{profile?.name || "Ali Hamza"}</span>
            </h1>
            <p className="py-4 text-xl sm:text-2xl font-medium opacity-90">
              {profile?.title || "MERN Stack Developer"}
            </p>
            <p className="mb-8 opacity-75 max-w-lg mx-auto text-base leading-relaxed">
              {profile?.about?.substring(0, 160) ||
                "Passionate full-stack developer specializing in building modern, scalable web applications with clean architecture."}
              ...
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="#projects"
                className="btn btn-primary hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
              >
                View Projects
              </a>
              <a
                href="#contact"
                className="btn btn-outline hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-base-100">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-10">
            About <span className="gradient-text">Me</span>
          </h2>
          <div className="card bg-base-200 shadow-xl card-hover-subtle border border-base-300">
            <div className="card-body">
              <p className="text-lg leading-relaxed opacity-90">
                {profile?.about ||
                  "Passionate full-stack developer specializing in the MERN stack. I love building modern, scalable web applications."}
              </p>
              <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-base-300 text-sm">
                {profile?.location && (
                  <div className="flex items-center gap-2 opacity-80">
                    <FaMapMarkerAlt className="text-primary" />
                    <span><strong>Location:</strong> {profile.location}</span>
                  </div>
                )}
                {profile?.email && (
                  <div className="flex items-center gap-2 opacity-80">
                    <FaEnvelope className="text-primary" />
                    <span><strong>Email:</strong> {profile.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 bg-base-200">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-10">
            My <span className="gradient-text">Skills</span>
          </h2>
          {skills.length === 0 ? (
            <p className="text-center opacity-70">No skills added yet. Add them from the Admin Panel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <div
                  key={skill._id}
                  className="card bg-base-100 shadow-md card-hover border border-transparent hover:border-primary/30"
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg flex justify-between items-center">
                      <span>{skill.name}</span>
                      <span className="badge badge-primary badge-outline text-xs">{skill.level}%</span>
                    </h3>
                    <p className="text-xs opacity-60 uppercase tracking-wider">{skill.category}</p>
                    <div className="w-full bg-base-200 rounded-full h-2.5 mt-2 overflow-hidden">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
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
          <h2 className="text-4xl font-bold text-center mb-10">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          {projects.length === 0 ? (
            <p className="text-center opacity-70">No projects yet. Add them from the Admin Panel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="card bg-base-200 shadow-xl card-hover group border border-base-300 overflow-hidden"
                >
                  {project.image && (
                    <figure className="overflow-hidden h-48 bg-base-300">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h3 className="card-title text-xl font-bold group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm opacity-80 line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 my-2">
                      {project.techStack?.map((tech, i) => (
                        <span key={i} className="badge badge-outline badge-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="card-actions justify-end mt-4 pt-3 border-t border-base-300/50">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm gap-2 hover:scale-105 transition-transform"
                        >
                          <FaGithub /> Code
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm gap-2 hover:scale-105 transition-transform shadow"
                        >
                          <FaExternalLinkAlt className="text-xs" /> Live
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
          <h2 className="text-4xl font-bold text-center mb-10">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <form
            onSubmit={handleSubmit}
            className="card bg-base-100 shadow-xl card-hover-subtle border border-base-300"
          >
            <div className="card-body gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="input input-bordered w-full focus:input-primary transition-all"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="input input-bordered w-full focus:input-primary transition-all"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                className="input input-bordered w-full focus:input-primary transition-all"
                value={formData.subject}
                onChange={handleChange}
              />
              <textarea
                name="message"
                placeholder="Your Message"
                className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-all"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button
                type="submit"
                className="btn btn-primary w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
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
