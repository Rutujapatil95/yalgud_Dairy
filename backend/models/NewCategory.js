// models/NewCategory.js
const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema({
  ItemCategoryCode: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true }
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  DeptCode: { type: String, required: true, trim: true },
  categoryName: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true, default: "" },
  imagePath: { type: String, trim: true, default: "" }, // stores uploads/<filename> or a full URL
  categoryItems: { type: [SubcategorySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("NewCategory", CategorySchema);


