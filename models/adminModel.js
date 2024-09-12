const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      required: true,
      enum: ["Admin", "Co-Admin", "Sub-Admin", "Super-Admin"],
    },
    whatsappNumber: { type: String, default: "" },
    whatsappCountry: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    phoneNumber: { type: String, required: true },
    phoneCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    expoPushToken: { type: String, default: "" },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
adminSchema.methods.setResetOtp = function (otp) {
    if (
      Buffer.from(process.env.OTP_SECRET_KEY, "hex").length !== 32 ||
      Buffer.from(process.env.OTP_IV, "hex").length !== 16
    ) {
      throw new Error("Invalid secret key or IV length");
    }
  // Encrypt the OTP before saving
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.OTP_SECRET_KEY, "hex"),
    Buffer.from(process.env.OTP_IV, "hex")
  );
  let encryptedOtp = cipher.update(otp, "utf8", "hex");
  encryptedOtp += cipher.final("hex");
  this.resetOtp = encryptedOtp;
};

adminSchema.methods.verifyResetOtp = function (otp) {
  // Decrypt the OTP
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.OTP_SECRET_KEY, "hex"),
    Buffer.from(process.env.OTP_IV, "hex")
  );
  let decryptedOtp = decipher.update(this.resetOtp, "hex", "utf8");
  decryptedOtp += decipher.final("utf8");
  return decryptedOtp === otp;
};
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
