const asyncHandler = require("express-async-handler");
const Profile = require("../models/profile-model");

// @desc    Get profile
// @route   GET /api/profile
// @access  Public
const getProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne();

  // If no profile exists, create a default one
  if (!profile) {
    profile = await Profile.create({
      name: "Ali Hamza",
      title: "Developer And IT Support Officer",
      about:
        "Developer And IT Support Officer with experience building modern web applications using the MERN stack. Passionate about creating clean, responsive, and user-friendly websites and dashboards. Always learning and exploring new technologies.",
      location: "Pakistan",
      profilePhoto: "https://avatars.githubusercontent.com/u/127236697?v=4",
      socialLinks: {
        github: "https://github.com/AliHamza917",
        linkedin: "",
        twitter: "",
        instagram: "",
        website: "",
      },
    });
  }

  res.set("Cache-Control", "no-cache, must-revalidate");
  res.status(200).json(profile);
});

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne();

  if (!profile) {
    profile = new Profile();
  }

  const {
    name,
    title,
    about,
    email,
    phone,
    location,
    profilePhoto,
    resumeLink,
    socialLinks,
  } = req.body;

  if (name !== undefined) profile.name = name;
  if (title !== undefined) profile.title = title;
  if (about !== undefined) profile.about = about;
  if (email !== undefined) profile.email = email;
  if (phone !== undefined) profile.phone = phone;
  if (location !== undefined) profile.location = location;
  if (profilePhoto !== undefined) profile.profilePhoto = profilePhoto;
  if (resumeLink !== undefined) profile.resumeLink = resumeLink;

  if (socialLinks && typeof socialLinks === "object") {
    profile.socialLinks = {
      github: socialLinks.github !== undefined ? socialLinks.github : (profile.socialLinks?.github || ""),
      linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin : (profile.socialLinks?.linkedin || ""),
      twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : (profile.socialLinks?.twitter || ""),
      instagram: socialLinks.instagram !== undefined ? socialLinks.instagram : (profile.socialLinks?.instagram || ""),
      website: socialLinks.website !== undefined ? socialLinks.website : (profile.socialLinks?.website || ""),
    };
  }

  const savedProfile = await profile.save();
  res.status(200).json(savedProfile);
});

module.exports = {
  getProfile,
  updateProfile,
};
