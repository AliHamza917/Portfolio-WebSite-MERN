const asyncHandler = require("express-async-handler");
const Project = require("../models/project-model");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-cache, must-revalidate");
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  res.status(200).json(projects);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.status(200).json(project);
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { title, description, techStack, liveLink, githubLink, image, featured, order } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required");
  }

  const project = await Project.create({
    title,
    description,
    techStack: Array.isArray(techStack) ? techStack.filter(Boolean) : [],
    liveLink: liveLink || "",
    githubLink: githubLink || "",
    image: image || "",
    featured: Boolean(featured),
    order: Number(order) || 0,
  });

  res.status(201).json(project);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Prevent modifying immutable fields
  const updateData = { ...req.body };
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  delete updateData.__v;

  if (updateData.techStack && Array.isArray(updateData.techStack)) {
    updateData.techStack = updateData.techStack.filter(Boolean);
  }

  const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  await project.deleteOne();
  res.status(200).json({ message: "Project deleted successfully", id: req.params.id });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
