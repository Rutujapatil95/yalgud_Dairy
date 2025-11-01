// config/db.js
const mongoose = require("mongoose");
require("dotenv").config(); // load .env

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MongoDB URI not defined in .env");

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // console.log("✅ MongoDB connected successfully to", MONGO_URI);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
