const express = require("express");
const {
  signup,
  login,
  getLoggedUser,
  verifyEmail,
  forgotPassword,
  confirmOtp,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/verify/:token", verifyEmail);
router.post("/login", login);
router.get("/loggeduser", protect, getLoggedUser);
router.post("/forgot-password", forgotPassword);
router.post("/confirm-otp", confirmOtp);
router.post("/reset-password", resetPassword);
module.exports = router;
