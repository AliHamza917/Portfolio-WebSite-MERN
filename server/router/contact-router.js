const express = require("express");
const router = express.Router();
const {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact,
} = require("../controllers/contact-controller");
const { protect } = require("../middleware/auth-middleware");

router.route("/").post(submitContact).get(protect, getContacts);
router.route("/:id").put(protect, markAsRead).delete(protect, deleteContact);

module.exports = router;
