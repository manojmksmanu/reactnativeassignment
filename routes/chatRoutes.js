const express = require("express");
const {
  sendMessage,
  getMessages,
  getUsers,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Send message (protected)
router.post("/message", protect, sendMessage);

// Get messages (protected)
router.get("/messages/:chatUserId", protect, getMessages);

// Get all users (protected, only admin)
router.get("/users", protect, getUsers);

module.exports = router;
