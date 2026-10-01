const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profile-controller");
const { protect } = require("../middleware/auth-middleware");

router.route("/").get(getProfile).put(protect, updateProfile);

module.exports = router;
