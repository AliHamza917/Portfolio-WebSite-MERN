import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaExternalLinkAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFileDownload,
  FaCode,
  FaServer,
  FaPalette,
  FaPaperPlane,
} from "react-icons/fa";

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
        console.error("Error fetching portfolio data:", error);
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
      toast.success("Message sent successfully! I'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Group skills by category if available
  const coreTech = ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "JavaScript"];

  return (
    <div className="overflow-hidden bg-base-100 transition-colors duration-300">
      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-[92vh] flex items-center justify-center py-20 px-4 bg-grid-pattern"
      >
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10 animate-fade-in-up">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-6 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Available for Freelance & Full-time Roles</span>
          </div>

          {/* Avatar with Glow and Float */}
          {profile?.profilePhoto && (
            <div className="avatar mb-6 animate-float flex justify-center">
              <div className="w-36 sm:w-44 rounded-full ring-4 ring-primary ring-offset-base-100 ring-offset-4 animate-pulse-glow shadow-2xl">
                <img src={profile.profilePhoto} alt={profile.name} />
              </div>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-3">
            Hi, I'm{" "}
            <span className="gradient-text font-black">
              {profile?.name || "Ali Hamza"}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold opacity-90 mb-4 text-primary">
            {profile?.title || "MERN Stack Developer & IT Support Officer"}
          </p>

          <p className="max-w-2xl mx-auto text-base sm:text-lg opacity-75 leading-relaxed mb-8">
            {profile?.about?.substring(0, 180) ||
              "Specialized in developing full-stack web applications using MongoDB, Express, React, and Node.js with scalable architecture and sleek responsive interfaces."}
            ...
          </p>

          {/* Quick Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-xl mx-auto">
            {coreTech.map((tech) => (
              <span
                key={tech}
                className="badge badge-lg bg-base-200/80 border border-base-content/10 font-medium px-3 py-1 text-xs"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap gap-4 justify-center items-center mb-8">
            <a
              href="#projects"
              className="btn btn-primary px-8 shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Explore Projects
            </a>
            <a
              href="#contact"
              className="btn btn-outline hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Get In Touch
            </a>
            {profile?.resumeLink && (
              <a
                href={profile.resumeLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost gap-2 hover:bg-base-200"
              >
                <FaFileDownload /> Resume
              </a>
            )}
          </div>

          {/* Social Icons in Hero */}
          <div className="flex justify-center items-center gap-4 text-xl">
            {profile?.socialLinks?.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-base-200/80 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm border border-base-content/10"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
            )}
            {profile?.socialLinks?.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-base-200/80 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm border border-base-content/10"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            )}
            {profile?.socialLinks?.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-base-200/80 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm border border-base-content/10"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            )}
            {profile?.socialLinks?.instagram && (
              <a
                href={profile.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-base-200/80 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm border border-base-content/10"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-base-200/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
              About <span className="gradient-text">Me</span>
            </h2>
            <p className="text-sm sm:text-base opacity-70 max-w-lg mx-auto">
              Get to know more about my background, philosophy, and tech expertise.
            </p>
          </div>

          {/* Pillars Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card bg-base-100 shadow-lg card-hover border border-base-content/10">
              <div className="card-body">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-3">
                  <FaCode />
                </div>
                <h3 className="card-title text-lg font-bold">Frontend Mastery</h3>
                <p className="text-sm opacity-75">
                  Building responsive, intuitive interfaces with React, Tailwind CSS, and DaisyUI.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg card-hover border border-base-content/10">
              <div className="card-body">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl mb-3">
                  <FaServer />
                </div>
                <h3 className="card-title text-lg font-bold">Backend & APIs</h3>
                <p className="text-sm opacity-75">
                  Architecting robust Express REST APIs, secure JWT auth, and optimized MongoDB schemas.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg card-hover border border-base-content/10">
              <div className="card-body">
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-xl mb-3">
                  <FaPalette />
                </div>
                <h3 className="card-title text-lg font-bold">Clean UX & Polish</h3>
                <p className="text-sm opacity-75">
                  Delivering performant web applications with dark/light themes and modern animations.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Bio Card */}
          <div className="card bg-base-100 shadow-xl card-hover-subtle border border-base-content/10">
            <div className="card-body p-8">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span>Background & Summary</span>
              </h3>
              <p className="text-base sm:text-lg leading-relaxed opacity-90">
                {profile?.about ||
                  "Developer and IT Support Officer with extensive experience building modern web applications using the MERN stack. Passionate about creating clean, responsive, and user-friendly websites and dashboards. Always learning, improving, and exploring modern web architectures."}
              </p>

              <div className="flex flex-wrap gap-8 mt-6 pt-6 border-t border-base-content/10 text-sm">
                {profile?.location && (
                  <div className="flex items-center gap-2 opacity-80">
                    <FaMapMarkerAlt className="text-primary text-base" />
                    <span><strong>Location:</strong> {profile.location}</span>
                  </div>
                )}
                {profile?.email && (
                  <div className="flex items-center gap-2 opacity-80">
                    <FaEnvelope className="text-primary text-base" />
                    <span><strong>Email:</strong> {profile.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 px-4 bg-base-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Technical <span className="gradient-text">Skills</span>
            </h2>
            <p className="text-sm sm:text-base opacity-70 max-w-lg mx-auto">
              Technologies and tools I use to bring ideas to reality.
            </p>
          </div>

          {skills.length === 0 ? (
            <p className="text-center opacity-70">
              No skills added yet. Add them easily from the Admin Panel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <div
                  key={skill._id}
                  className="card bg-base-200/60 shadow-md card-hover border border-base-content/10 hover:border-primary/40 transition-all"
                >
                  <div className="card-body p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-base">{skill.name}</h3>
                      <span className="badge badge-primary badge-outline text-xs font-semibold">
                        {skill.level}%
                      </span>
                    </div>
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-3 font-medium">
                      {skill.category || "Development"}
                    </p>
                    <div className="w-full bg-base-300 rounded-full h-2.5 overflow-hidden">
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
      <section id="projects" className="py-24 px-4 bg-base-200/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <p className="text-sm sm:text-base opacity-70 max-w-lg mx-auto">
              Real-world web applications and projects built with modern frameworks.
            </p>
          </div>

          {projects.length === 0 ? (
            <p className="text-center opacity-70">
              No projects added yet. Add projects from the Admin Panel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="card bg-base-100 shadow-xl card-hover group border border-base-content/10 overflow-hidden flex flex-col justify-between"
                >
                  {project.image ? (
                    <figure className="overflow-hidden h-52 bg-base-300 relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </figure>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-primary/15 via-secondary/10 to-base-300 flex items-center justify-center p-6 border-b border-base-content/10">
                      <FaCode className="text-4xl opacity-30 text-primary" />
                    </div>
                  )}

                  <div className="card-body p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="card-title text-xl font-bold group-hover:text-primary transition-colors mb-2">
                        {project.title}
                      </h3>
                      <p className="text-sm opacity-80 line-clamp-3 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {project.techStack?.map((tech, i) => (
                          <span
                            key={i}
                            className="badge badge-sm bg-base-200 border border-base-content/10 font-medium text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-4 pt-4 border-t border-base-content/10 gap-2">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
                        >
                          <FaGithub /> Code
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm gap-2 hover:scale-105 active:scale-95 transition-all shadow"
                        >
                          <FaExternalLinkAlt className="text-xs" /> Live Demo
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
      <section id="contact" className="py-24 px-4 bg-base-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Let's <span className="gradient-text">Connect</span>
            </h2>
            <p className="text-sm sm:text-base opacity-70 max-w-lg mx-auto">
              Have a project in mind, a question, or a career opportunity? Feel free to reach out!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left Contact Info Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card bg-base-200/70 p-6 rounded-2xl border border-base-content/10 shadow-md">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <p className="text-sm opacity-80 mb-6 leading-relaxed">
                  I'm actively seeking exciting frontend/backend roles and freelance projects. Let's create something extraordinary together.
                </p>

                <div className="space-y-4 text-sm">
                  {profile?.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FaEnvelope />
                      </div>
                      <div>
                        <p className="text-xs opacity-60">Email Address</p>
                        <a href={`mailto:${profile.email}`} className="font-medium hover:text-primary transition-colors">
                          {profile.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {profile?.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <p className="text-xs opacity-60">Location</p>
                        <p className="font-medium">{profile.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="card bg-base-100 shadow-2xl p-6 sm:p-8 rounded-2xl border border-base-content/10 card-hover-subtle"
              >
                <h3 className="text-xl font-bold mb-6">Send Me a Message</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label text-xs font-semibold uppercase opacity-70">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        className="input input-bordered w-full focus:input-primary transition-all"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="label text-xs font-semibold uppercase opacity-70">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        className="input input-bordered w-full focus:input-primary transition-all"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label text-xs font-semibold uppercase opacity-70">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Project Inquiry / Job Opportunity"
                      className="input input-bordered w-full focus:input-primary transition-all"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="label text-xs font-semibold uppercase opacity-70">
                      Message
                    </label>
                    <textarea
                      name="message"
                      placeholder="Hi Ali, I loved your work and would like to discuss..."
                      className="textarea textarea-bordered w-full h-36 focus:textarea-primary transition-all leading-relaxed"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full gap-2 shadow-lg hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    disabled={loading}
                  >
                    <FaPaperPlane className="text-sm" />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
