const { getChatsForUser } = require("../misc/misc");
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
//Get all chats
router.get("/:userId/chats", protect, async (req, res) => {
  const chats = await getChatsForUser(req.params.userId);
  res.json(chats);
});
module.exports = router;
