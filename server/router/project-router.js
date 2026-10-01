const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project-controller");
const { protect } = require("../middleware/auth-middleware");

router.route("/").get(getProjects).post(protect, createProject);
router
  .route("/:id")
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
