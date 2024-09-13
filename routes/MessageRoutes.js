const express = require("express");
const {
  sendMessage,
  getMessages,
  getUsers,
  forwardMessages,
} = require("../controllers/MessageController/messageController");
const { protect } = require("../middleware/AuthMiddleWare/authMiddleware");
const { getChatsForUser } = require("../misc/misc");
const router = express.Router();

// Send message (protected)
router.post("/message", protect, sendMessage);

// Get messages (protected)
router.get("/messages/:chatId", protect, getMessages);

// Get all users (protected, only admin)
router.get("/users", protect, getUsers);

router.post("/forwardMessages", protect, forwardMessages);
module.exports = router;
