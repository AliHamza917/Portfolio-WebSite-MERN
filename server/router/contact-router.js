const express = require("express");
const router = express.Router();
const {
  submitContact,
  getContacts,
  getUnreadCount,
  markAsRead,
  replyContact,
  deleteContact,
} = require("../controllers/contact-controller");
const { protect } = require("../middleware/auth-middleware");

router.route("/").post(submitContact).get(protect, getContacts);
router.get("/unread-count", protect, getUnreadCount);
router.route("/:id").put(protect, markAsRead).delete(protect, deleteContact);
router.put("/:id/reply", protect, replyContact);

module.exports = router;
