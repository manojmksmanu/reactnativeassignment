const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      // "mongodb+srv://manoj2022019:7gxePcOGu7SnvvVL@nativechat.unnjx.mongodb.net/?retryWrites=true&w=majority&appName=nativechat"
       "mongodb+srv://manoj2022019:7gxePcOGu7SnvvVL@nativechat.unnjx.mongodb.net/?retryWrites=true&w=majority&appName=nativechat/chatnative"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
