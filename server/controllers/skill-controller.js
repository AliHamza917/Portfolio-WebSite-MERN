const asyncHandler = require("express-async-handler");
const Skill = require("../models/skill-model");

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find().sort({ order: 1, category: 1 });
  res.status(200).json(skills);
});

// @desc    Create skill
// @route   POST /api/skills
// @access  Private
const createSkill = asyncHandler(async (req, res) => {
  const { name, category, level, icon, order } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Skill name is required");
  }

  const skill = await Skill.create({
    name,
    category: category || "Other",
    level: level || 70,
    icon,
    order: order || 0,
  });

  res.status(201).json(skill);
});

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedSkill);
});

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  await skill.deleteOne();
  res.status(200).json({ message: "Skill deleted successfully", id: req.params.id });
});

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
