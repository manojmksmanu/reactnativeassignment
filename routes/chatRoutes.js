const {
  getChatsForUser,
  createGroupChat,
} = require("../controllers/ChatController/chatController");

const express = require("express");
const { protect } = require("../middleware/AuthMiddleWare/authMiddleware");
const router = express.Router();

router.get("/:userId/chats", protect, async (req, res) => {
  const chats = await getChatsForUser(req.params.userId);
  res.json(chats);
});

router.post("/creategroup", protect, createGroupChat);
module.exports = router;
