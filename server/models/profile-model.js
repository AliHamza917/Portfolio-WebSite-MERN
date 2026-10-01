const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Ali Hamza",
    },
    title: {
      type: String,
      default: "Developer And IT Support Officer",
    },
    about: {
      type: String,
      default:
        "Developer And IT Support Officer with experience building modern web applications using the MERN stack. Passionate about creating clean, responsive, and user-friendly websites and dashboards. Always learning and exploring new technologies.",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "Pakistan",
    },
    profilePhoto: {
      type: String,
      default: "https://avatars.githubusercontent.com/u/127236697?v=4",
    },
    resumeLink: {
      type: String,
      default: "",
    },
    socialLinks: {
      github: { type: String, default: "https://github.com/AliHamza917" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      website: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
