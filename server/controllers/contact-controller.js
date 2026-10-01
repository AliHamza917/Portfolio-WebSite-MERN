const asyncHandler = require("express-async-handler");
const Contact = require("../models/contact-model");

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }

  const contact = await Contact.create({
    name,
    email,
    subject: subject || "",
    message,
  });

  res.status(201).json({
    message: "Message sent successfully",
    contact,
  });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.status(200).json(contacts);
});

// @desc    Mark message as read
// @route   PUT /api/contact/:id
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error("Message not found");
  }

  contact.isRead = true;
  await contact.save();

  res.status(200).json(contact);
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error("Message not found");
  }

  await contact.deleteOne();
  res.status(200).json({ message: "Message deleted successfully", id: req.params.id });
});

module.exports = {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact,
};
