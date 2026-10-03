/**
 * Seed script - Run once after setting up MongoDB
 * Usage: node utills/seed.js
 * (Make sure .env is configured first)
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");
const Project = require("../models/project-model");
const Skill = require("../models/skill-model");
const Profile = require("../models/profile-model");
const User = require("../models/user-model");

const projects = [
  {
    title: "Student Portal",
    description:
      "A full-stack student management system built with MERN stack. Features authentication, dashboard, and admin panel. Deployed on Vercel.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    liveLink: "https://student-portal-khaki.vercel.app",
    githubLink: "https://github.com/AliHamza917/student-portal",
    image: "",
    featured: true,
    order: 1,
  },
  {
    title: "React Home Comfort Responsive",
    description:
      "A modern, fully responsive furniture/home comfort website built with React. Clean UI and mobile-friendly design.",
    techStack: ["React", "JavaScript", "CSS", "Responsive Design"],
    liveLink: "https://react-home-comfort-responsive.vercel.app",
    githubLink: "https://github.com/AliHamza917/React-Home-Comfort-Responsive",
    image: "",
    featured: true,
    order: 2,
  },
  {
    title: "Young Dev Website",
    description:
      "Official website for Young Dev community. Showcases programs, events and resources for young developers.",
    techStack: ["JavaScript", "React", "CSS"],
    liveLink: "https://young-dev-website.vercel.app",
    githubLink: "https://github.com/AliHamza917/young-dev-website",
    image: "",
    featured: true,
    order: 3,
  },
  {
    title: "Dice Game",
    description:
      "Interactive dice game built with JavaScript. Fun and simple browser-based game with score tracking.",
    techStack: ["JavaScript", "HTML", "CSS"],
    liveLink: "https://dice-game-seven-xi.vercel.app",
    githubLink: "https://github.com/AliHamza917/Dice-Game",
    image: "",
    featured: false,
    order: 4,
  },
  {
    title: "Online Education Site",
    description:
      "Responsive online education platform UI. Clean design focused on learning experience and course presentation.",
    techStack: ["JavaScript", "HTML", "CSS", "Responsive Design"],
    liveLink: "https://online-education-site-responsive.vercel.app",
    githubLink: "https://github.com/AliHamza917/online-education-site-responsive",
    image: "",
    featured: false,
    order: 5,
  },
  {
    title: "Networking Web Dashboard with Grok",
    description:
      "A networking web dashboard integrated with Grok AI. Useful for monitoring and managing network-related data.",
    techStack: ["HTML", "JavaScript", "CSS"],
    liveLink: "",
    githubLink: "https://github.com/AliHamza917/Networking-Web-Dashboard-With-GROK",
    image: "",
    featured: false,
    order: 6,
  },
  {
    title: "YETP First Class",
    description:
      "First class project for YETP program. Simple and clean HTML based website.",
    techStack: ["HTML", "CSS"],
    liveLink: "https://yetp-first-class.vercel.app",
    githubLink: "https://github.com/AliHamza917/yetp_first_class",
    image: "",
    featured: false,
    order: 7,
  },
];

const skills = [
  { name: "HTML", category: "Frontend", level: 90, order: 1 },
  { name: "CSS", category: "Frontend", level: 85, order: 2 },
  { name: "JavaScript", category: "Frontend", level: 85, order: 3 },
  { name: "React", category: "Frontend", level: 80, order: 4 },
  { name: "Tailwind CSS", category: "Frontend", level: 80, order: 5 },
  { name: "Node.js", category: "Backend", level: 75, order: 6 },
  { name: "Express.js", category: "Backend", level: 75, order: 7 },
  { name: "MongoDB", category: "Database", level: 70, order: 8 },
  { name: "Mongoose", category: "Database", level: 70, order: 9 },
  { name: "Git & GitHub", category: "Tools", level: 80, order: 10 },
  { name: "Vercel", category: "Tools", level: 75, order: 11 },
  { name: "IT Support", category: "Other", level: 85, order: 12 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing)
    await Project.deleteMany({});
    await Skill.deleteMany({});
    console.log("Cleared old projects & skills");

    // Seed Projects
    await Project.insertMany(projects);
    console.log(`✅ Seeded ${projects.length} projects`);

    // Seed Skills
    await Skill.insertMany(skills);
    console.log(`✅ Seeded ${skills.length} skills`);

    // Ensure Profile exists
    let profile = await Profile.findOne();
    if (!profile) {
      await Profile.create({
        name: "Ali Hamza",
        title: "Developer And IT Support Officer",
        about:
          "Developer And IT Support Officer with experience building modern web applications using the MERN stack. Passionate about creating clean, responsive, and user-friendly websites and dashboards. Always learning and exploring new technologies.",
        location: "Pakistan",
        profilePhoto: "https://avatars.githubusercontent.com/u/127236697?v=4",
        socialLinks: {
          github: "https://github.com/AliHamza917",
        },
      });
      console.log("✅ Created default profile");
    } else {
      console.log("Profile already exists");
    }

    // Create default admin if none exists
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      console.log("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set - skipped admin creation.");
    } else if (!(await User.findOne({ email: adminEmail.toLowerCase() }))) {
      await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: adminEmail,
        password: adminPassword,
      });
      console.log(`✅ Created admin: ${adminEmail}`);
    } else {
      console.log("Admin already exists");
    }

    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
