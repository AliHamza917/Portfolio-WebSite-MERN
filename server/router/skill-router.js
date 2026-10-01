const express = require("express");
const router = express.Router();
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skill-controller");
const { protect } = require("../middleware/auth-middleware");

router.route("/").get(getSkills).post(protect, createSkill);
router.route("/:id").put(protect, updateSkill).delete(protect, deleteSkill);

module.exports = router;
