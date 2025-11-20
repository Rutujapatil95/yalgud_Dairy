const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  pin: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
