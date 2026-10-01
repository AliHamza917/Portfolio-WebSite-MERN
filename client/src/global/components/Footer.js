import { useState, useEffect } from "react";
import axios from "axios";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/profile");
        setProfile(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <footer className="footer footer-center p-10 bg-base-300 text-base-content">
      <aside>
        <p className="font-bold text-lg">
          {profile?.name || "Ali Hamza"}
        </p>
        <p>{profile?.title || "MERN Stack Developer"}</p>
        <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
      </aside>
      <nav>
        <div className="grid grid-flow-col gap-4 text-2xl">
          {profile?.socialLinks?.github && (
            <a href={profile.socialLinks.github} target="_blank" rel="noreferrer">
              <FaGithub />
            </a>
          )}
          {profile?.socialLinks?.linkedin && (
            <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer">
              <FaLinkedin />
            </a>
          )}
          {profile?.socialLinks?.twitter && (
            <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
          )}
          {profile?.socialLinks?.instagram && (
            <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
          )}
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
