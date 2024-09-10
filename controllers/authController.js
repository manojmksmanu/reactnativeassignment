const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const Student = require("../models/studentModel");
const Tutor = require("../models/tutorModel");
const { findUserById } = require("../misc/misc");
const sendVerificationEmail = require("../misc/emailSendFunction");

const generateToken = (id) => {
  return jwt.sign({ id }, "your_jwt_secret", {
    expiresIn: "30d",
  });
};

exports.signup = async (req, res) => {
  const {
    name,
    email,
    password,
    userType,
    phoneNumber,
    phoneCountry,
    whatsappNumber,
    whatsappCountry,
  } = req.body;

  try {
    let existingUser;
    // Check if email exists for Admin
    if (userType === "Admin") {
      existingUser = await Admin.findOne({ email });
    }
    // Check if email exists for Student
    else if (userType === "Student") {
      existingUser = await Student.findOne({ email });
    }
    // Check if email exists for Tutor
    else if (userType === "Tutor") {
      existingUser = await Tutor.findOne({ email });
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }
    // If email already exists
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists. Please try a different email.",
      });
    }
    // Create new user
    let user;
    if (userType === "Admin") {
      user = new Admin({
        name,
        email,
        password,
        userType,
        phoneNumber,
        phoneCountry,
        whatsappNumber,
        whatsappCountry,
      });
    } else if (userType === "Student") {
      user = new Student({
        name,
        email,
        password,
        userType,
        phoneNumber,
        phoneCountry,
        whatsappNumber,
        whatsappCountry,
      });
    } else if (userType === "Tutor") {
      user = new Tutor({
        name,
        email,
        password,
        userType,
        phoneNumber,
        phoneCountry,
        whatsappNumber,
        whatsappCountry,
      });
    }

    // Save user in the database
    await user.save();

    // Generate verification link
    const verificationToken = generateToken(user._id);
    const verificationLink = `${process.env.BASE_URL}/api/users/verify/${verificationToken}`;

    // Send verification email
    await sendVerificationEmail({
      email: user.email,
      verificationLink: verificationLink,
    });

    res.status(201).json({
      message:
        "User registered. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    // Decode token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    // Find user in the Admin, Student, or Tutor collection
    let user =
      (await Admin.findById(userId)) ||
      (await Student.findById(userId)) ||
      (await Tutor.findById(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update the `isVerified` field
    user.isVerified = true;
    await user.save();
    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, userType, password } = req.body;
  if (userType === "Admin") {
    try {
      const user = await Admin.findOne({ email });

      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          isAdmin: user.userType,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  if (userType === "Student") {
    try {
      const user = await Student.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          isAdmin: user.userType,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  if (userType === "Tutor") {
    try {
      const user = await Tutor.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          isAdmin: user.userType,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }
};

exports.getLoggedUser = async (req, res) => {
  try {
    const user = req.user;
    // Use findOne instead of find to get a single user document
    const loggedUser = await findUserById({ userId: user._id }); // Exclude the password field
    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(loggedUser);
  } catch (error) {
    console.error("Error fetching logged user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
