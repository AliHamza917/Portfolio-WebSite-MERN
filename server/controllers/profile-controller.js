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
      },
    });
  }

  res.status(200).json(profile);
});

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne();

  if (!profile) {
    profile = await Profile.create(req.body);
  } else {
    profile = await Profile.findByIdAndUpdate(profile._id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json(profile);
});

module.exports = {
  getProfile,
  updateProfile,
};
