import { useState, useEffect } from "react";
import axios from "axios";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaHeart } from "react-icons/fa";

const Footer = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/profile");
        setProfile(data);
      } catch (error) {
        console.error("Footer fetch error:", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <footer className="footer footer-center p-10 bg-base-300/80 border-t border-base-content/10 text-base-content transition-colors duration-300">
      <div className="flex flex-col items-center gap-3">
        <a href="#home" className="text-2xl font-extrabold tracking-tight">
          <span className="gradient-text">{profile?.name || "Ali Hamza"}</span>
        </a>
        <p className="text-sm opacity-75 max-w-md">
          {profile?.title || "MERN Stack Developer"} &bull; Building modern, scalable, and responsive web experiences.
        </p>

        {/* Quick links */}
        <div className="flex flex-wrap gap-4 text-sm font-medium mt-2">
          <a href="#home" className="hover:text-primary transition-colors">Home</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#skills" className="hover:text-primary transition-colors">Skills</a>
          <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>

      <nav className="mt-2">
        <div className="flex gap-3 text-lg">
          {profile?.socialLinks?.github && (
            <a
              href={profile.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-base-200 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
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
              className="p-2.5 rounded-full bg-base-200 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
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
              className="p-2.5 rounded-full bg-base-200 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
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
              className="p-2.5 rounded-full bg-base-200 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
          )}
        </div>
      </nav>

      <aside className="mt-2 text-xs opacity-60">
        <p className="flex items-center gap-1 justify-center">
          <span>Crafted with</span>
          <FaHeart className="text-red-500 animate-pulse text-xs" />
          <span>using MERN Stack &bull; &copy; {new Date().getFullYear()} All rights reserved.</span>
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
