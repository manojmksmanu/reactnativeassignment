const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, enum: ["Student"] },
    whatsappNumber: { type: String },
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
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
