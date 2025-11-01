// models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    DeptCode: { type: Number, required: true }, // ✅ add this field
    groupTitleEnglish: { type: String, required: true },
    groupTitleMarathi: { type: String, required: true },
    nameEnglish: { type: String, required: true },
    nameMarathi: { type: String, required: true },
    descriptionEnglish: { type: String, default: "" },
    descriptionMarathi: { type: String, default: "" },
    page: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
