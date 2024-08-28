const express = require("express");
const {
  sendMessage,
  getMessages,
  getUsers,
  forwardMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const { getChatsForUser } = require("../misc/misc");
const router = express.Router();

// Send message (protected)
router.post("/message", protect, sendMessage);

// Get messages (protected)
router.get("/messages/:chatId", protect, getMessages);

// Get all users (protected, only admin)
router.get("/users", protect, getUsers);

//Get all chats
router.get("/:userId/chats", protect, async (req, res) => {
  const chats = await getChatsForUser(req.params.userId);
  res.json(chats);
});

router.post("/forwardMessages", protect, forwardMessages);
module.exports = router;
