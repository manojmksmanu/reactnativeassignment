const express = require("express");
const {
  signup,
  login,
  getLoggedUser,
  verifyEmail,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/verify/:token", verifyEmail);
router.post("/login", login);
router.get("/loggeduser", protect, getLoggedUser);

module.exports = router;
