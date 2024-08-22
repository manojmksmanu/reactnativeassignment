const express = require("express");
const { signup, login, getLoggedUser } = require("../controllers/authController");
const { protect, authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
