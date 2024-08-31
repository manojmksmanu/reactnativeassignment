const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Student = require("../models/studentModel");
const { findUserById } = require("../misc/misc");

exports.protect = async (req, res, next) => {
  let token;
  console.log(token, "tokken");
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);
      const decoded = jwt.verify(token, "your_jwt_secret");
      console.log(decoded);
      // req.user = await Student.findById(decoded.id).select("-password");
      req.user = await findUserById({userId:decoded.id});
      console.log(req.user);
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};
