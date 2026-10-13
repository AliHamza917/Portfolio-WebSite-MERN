import { useState, useEffect, useMemo } from "react";
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
  FaDatabase,
  FaTools,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaThLarge,
  FaLayerGroup,
  FaStar,
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

  // Arrangement and Filter states
  const [projectFilter, setProjectFilter] = useState("All");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectSort, setProjectSort] = useState("default");

  const [skillCategory, setSkillCategory] = useState("All");
  const [skillSort, setSkillSort] = useState("default");
  const [skillViewMode, setSkillViewMode] = useState("grouped"); // "grouped" | "grid"

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

  // Extract all unique skills/tech tags from projects for filtering
  const projectTechOptions = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      p.techStack?.forEach((t) => {
        if (t.trim()) set.add(t.trim());
      });
    });
    return ["All", ...Array.from(set).slice(0, 8)];
  }, [projects]);

  // Filtered and Arranged Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by tech/skill tag
    if (projectFilter !== "All") {
      result = result.filter((p) =>
        p.techStack?.some(
          (t) => t.toLowerCase() === projectFilter.toLowerCase()
        )
      );
    }

    // Search query
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.techStack?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort / Arrange
    result.sort((a, b) => {
      if (projectSort === "featured") {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.order ?? 0) - (b.order ?? 0);
      }
      if (projectSort === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (projectSort === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }
      // default: by order
      return (a.order ?? 0) - (b.order ?? 0);
    });

    return result;
  }, [projects, projectFilter, projectSearch, projectSort]);

  // Filtered and Arranged Skills
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // Filter by category
    if (skillCategory !== "All") {
      result = result.filter(
        (s) => s.category?.toLowerCase() === skillCategory.toLowerCase()
      );
    }

    // Sort / Arrange
    result.sort((a, b) => {
      if (skillSort === "proficiency") {
        return (b.level ?? 0) - (a.level ?? 0);
      }
      if (skillSort === "alphabetical") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // default: by order, then category
      if ((a.order ?? 0) !== (b.order ?? 0)) {
        return (a.order ?? 0) - (b.order ?? 0);
      }
      return (a.category || "").localeCompare(b.category || "");
    });

    return result;
  }, [skills, skillCategory, skillSort]);

  // Skills Grouped by Category
  const groupedSkills = useMemo(() => {
    const groups = {
      Frontend: [],
      Backend: [],
      Database: [],
      Tools: [],
      Other: [],
    };

    filteredSkills.forEach((s) => {
      const cat = s.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredSkills]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Frontend":
        return <FaCode className="text-primary" />;
      case "Backend":
        return <FaServer className="text-secondary" />;
      case "Database":
        return <FaDatabase className="text-accent" />;
      case "Tools":
        return <FaTools className="text-info" />;
      default:
        return <FaPalette className="text-warning" />;
    }
  };

  const coreTech = ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "JavaScript"];

  return (
    <div className="overflow-hidden bg-base-100 transition-colors duration-300">
      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-[92vh] flex items-center justify-center py-20 px-4 bg-grid-pattern"
      >
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

      {/* Skills Section with Arrange & Filter */}
      <section id="skills" className="py-24 px-4 bg-base-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Technical <span className="gradient-text">Skills</span>
            </h2>
            <p className="text-sm sm:text-base opacity-70 max-w-lg mx-auto">
              Filter by category or arrange by proficiency level.
            </p>
          </div>

          {/* Skill Filter & Arrange Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-base-200/60 p-4 rounded-2xl border border-base-content/10">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold opacity-60 flex items-center gap-1.5 mr-1">
                <FaFilter className="text-primary" /> Filter:
              </span>
              {["All", "Frontend", "Backend", "Database", "Tools"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategory(cat)}
                  className={`btn btn-xs rounded-full transition-all ${
                    skillCategory === cat
                      ? "btn-primary shadow-sm"
                      : "btn-ghost hover:bg-base-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Arrange / Sort & View Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5">
                <FaSortAmountDown className="text-xs opacity-60" />
                <select
                  value={skillSort}
                  onChange={(e) => setSkillSort(e.target.value)}
                  className="select select-xs select-bordered rounded-lg bg-base-100 font-medium"
                >
                  <option value="default">Default Order</option>
                  <option value="proficiency">Proficiency (High &rarr; Low)</option>
                  <option value="alphabetical">Name (A &rarr; Z)</option>
                </select>
              </div>

              {/* View Mode Toggle: Grouped vs Grid */}
              <div className="join border border-base-content/10 rounded-lg p-0.5 bg-base-100">
                <button
                  onClick={() => setSkillViewMode("grouped")}
                  className={`join-item btn btn-xs px-2.5 ${
                    skillViewMode === "grouped" ? "btn-primary" : "btn-ghost"
                  }`}
                  title="Group by Category"
                >
                  <FaLayerGroup />
                </button>
                <button
                  onClick={() => setSkillViewMode("grid")}
                  className={`join-item btn btn-xs px-2.5 ${
                    skillViewMode === "grid" ? "btn-primary" : "btn-ghost"
                  }`}
                  title="Grid View"
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          {filteredSkills.length === 0 ? (
            <div className="text-center py-12 bg-base-200/40 rounded-2xl border border-dashed border-base-content/20">
              <p className="opacity-70">No skills match the selected filter.</p>
              <button
                onClick={() => setSkillCategory("All")}
                className="btn btn-sm btn-ghost text-primary mt-2"
              >
                Reset Filter
              </button>
            </div>
          ) : skillViewMode === "grouped" && skillCategory === "All" ? (
            /* Grouped View by Category */
            <div className="space-y-8">
              {groupedSkills.map(([cat, catSkills]) => (
                <div
                  key={cat}
                  className="card bg-base-200/40 border border-base-content/10 p-6 rounded-2xl shadow-sm"
                >
                  <h3 className="text-xl font-bold flex items-center gap-2.5 mb-6 pb-3 border-b border-base-content/10">
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                    <span className="badge badge-sm badge-ghost opacity-70">
                      {catSkills.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catSkills.map((skill) => (
                      <div
                        key={skill._id}
                        className="card bg-base-100 shadow-md card-hover border border-base-content/5 p-4 rounded-xl"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm">{skill.name}</span>
                          <span className="badge badge-primary badge-outline text-xs font-semibold">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Unified Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill) => (
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

      {/* Projects Section with Arrange by Skills & Search */}
      <section id="projects" className="py-24 px-4 bg-base-200/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <p className="text-sm sm:text-base opacity-70 max-w-lg mx-auto">
              Filter and arrange projects by skills, tech stack, or search keyword.
            </p>
          </div>

          {/* Project Filtering & Sorting Toolbar */}
          <div className="bg-base-100 p-5 rounded-2xl border border-base-content/10 shadow-lg mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-50" />
                <input
                  type="text"
                  placeholder="Search projects or skills..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="input input-bordered input-sm w-full pl-9 rounded-lg"
                />
              </div>

              {/* Sort / Arrange Dropdown & Count */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-xs opacity-60 font-medium">
                  Showing <strong>{filteredProjects.length}</strong> of {projects.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <FaSortAmountDown className="text-xs opacity-60" />
                  <select
                    value={projectSort}
                    onChange={(e) => setProjectSort(e.target.value)}
                    className="select select-xs select-bordered rounded-lg bg-base-200 font-medium"
                  >
                    <option value="default">Default Order</option>
                    <option value="featured">Featured First</option>
                    <option value="newest">Newest First</option>
                    <option value="alphabetical">Title (A &rarr; Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter by Skill / Tech Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-base-content/10">
              <span className="text-xs font-semibold opacity-60 flex items-center gap-1 mr-1">
                <FaFilter className="text-primary text-xs" /> Arrange by Skill:
              </span>
              {projectTechOptions.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setProjectFilter(tech)}
                  className={`btn btn-xs rounded-full transition-all ${
                    projectFilter === tech
                      ? "btn-primary shadow-sm"
                      : "btn-ghost bg-base-200/60 hover:bg-base-300"
                  }`}
                >
                  {tech}
                </button>
              ))}
              {(projectFilter !== "All" || projectSearch) && (
                <button
                  onClick={() => {
                    setProjectFilter("All");
                    setProjectSearch("");
                  }}
                  className="btn btn-xs btn-ghost text-error ml-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-base-100 rounded-2xl border border-dashed border-base-content/20">
              <p className="text-lg opacity-70 mb-2">No projects match your filter criteria.</p>
              <button
                onClick={() => {
                  setProjectFilter("All");
                  setProjectSearch("");
                }}
                className="btn btn-sm btn-primary mt-2"
              >
                View All Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="card bg-base-100 shadow-xl card-hover group border border-base-content/10 overflow-hidden flex flex-col justify-between"
                >
                  {project.image ? (
                    <figure className="overflow-hidden h-52 bg-base-300 relative">
                      {project.featured && (
                        <div className="absolute top-3 right-3 z-10 badge badge-warning gap-1 font-semibold text-xs shadow-md">
                          <FaStar className="text-xs" /> Featured
                        </div>
                      )}
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </figure>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-primary/15 via-secondary/10 to-base-300 flex items-center justify-center p-6 border-b border-base-content/10 relative">
                      {project.featured && (
                        <div className="absolute top-3 right-3 z-10 badge badge-warning gap-1 font-semibold text-xs shadow-md">
                          <FaStar className="text-xs" /> Featured
                        </div>
                      )}
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
                          <button
                            key={i}
                            onClick={() => setProjectFilter(tech)}
                            className={`badge badge-sm cursor-pointer transition-all ${
                              projectFilter.toLowerCase() === tech.toLowerCase()
                                ? "badge-primary"
                                : "bg-base-200 border border-base-content/10 hover:border-primary"
                            }`}
                            title={`Filter by ${tech}`}
                          >
                            {tech}
                          </button>
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
