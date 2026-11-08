const asyncHandler = require("express-async-handler");
const Skill = require("../models/skill-model");

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-cache, must-revalidate");
  const skills = await Skill.find().sort({ order: 1, category: 1 });
  res.status(200).json(skills);
});

// @desc    Create skill
// @route   POST /api/skills
// @access  Private
const createSkill = asyncHandler(async (req, res) => {
  const { name, category, level, icon, order } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Skill name is required");
  }

  const skill = await Skill.create({
    name: name.trim(),
    category: category || "Other",
    level: level !== undefined && level !== "" ? Number(level) : 70,
    icon: icon || "",
    order: Number(order) || 0,
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

  // Prevent modifying immutable fields
  const updateData = { ...req.body };
  delete updateData._id;
  delete updateData.createdAt;
  delete updateData.updatedAt;
  delete updateData.__v;

  if (updateData.name) {
    updateData.name = updateData.name.trim();
  }
  if (updateData.level !== undefined && updateData.level !== "") {
    updateData.level = Number(updateData.level);
  }
  if (updateData.order !== undefined && updateData.order !== "") {
    updateData.order = Number(updateData.order);
  }

  const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, updateData, {
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
