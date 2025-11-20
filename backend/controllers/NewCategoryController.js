const fs = require("fs");
const path = require("path");
const Category = require("../models/NewCategory");

// Generate fallback code
const generateCode = () => `AUTO-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Escape regex
const escapeRegExp = str => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Parse subcategories
function parseSubcategories(value) {
  if (!value) return [];
  const output = [];
  const candidates = Array.isArray(value) ? value : [value];

  candidates.forEach(cand => {
    if (!cand) return;
    if (typeof cand === "object") {
      if (Array.isArray(cand)) {
        cand.forEach(it => it.name && output.push({ ItemCategoryCode: it.ItemCategoryCode || generateCode(), name: it.name }));
      } else if (cand.name) {
        output.push({ ItemCategoryCode: cand.ItemCategoryCode || generateCode(), name: cand.name });
      }
      return;
    }
    output.push({ ItemCategoryCode: generateCode(), name: String(cand).trim() });
  });

  // Deduplicate
  const uniq = [];
  const seen = new Set();
  output.forEach(item => {
    const key = `${item.ItemCategoryCode}||${item.name.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(item);
    }
  });
  return uniq;
}

// Get uploaded file
function getUploadedFile(req) {
  if (req.file) return req.file;
  if (req.files) {
    const keys = Object.keys(req.files);
    for (const k of keys) {
      if (Array.isArray(req.files[k]) && req.files[k].length) return req.files[k][0];
    }
  }
  return null;
}

// Delete file
function deleteFileIfExists(filePath) {
  if (!filePath) return;
  try {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (err) {
    console.warn("deleteFileIfExists:", err.message || err);
  }
}

// Convert path to full URL
function toFullImageURL(req, maybePath) {
  if (!maybePath) return "";
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const clean = maybePath.replace(/^\/+/, "").replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${clean}`;
}

/* ------------------ Controller Methods ------------------ */

// Create
exports.createCategory = async (req, res) => {
  try {
    const file = getUploadedFile(req);
    const { categoryName, DeptCode, description = "", categoryItems } = req.body;

    if (!DeptCode || !categoryName) return res.status(400).json({ message: "DeptCode and categoryName required" });

    const items = parseSubcategories(categoryItems);

    let imagePath = "";
    if (file) imagePath = toFullImageURL(req, `uploads/${file.filename}`);
    else if (req.body.imagePath) imagePath = toFullImageURL(req, req.body.imagePath);

    const exists = await Category.findOne({ categoryName: { $regex: `^${escapeRegExp(categoryName)}$`, $options: "i" } });
    if (exists) {
      if (file) deleteFileIfExists(`uploads/${file.filename}`);
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = new Category({ DeptCode, categoryName, description, imagePath, categoryItems: items });
    await category.save();
    return res.status(201).json({ message: "Category created", category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message || String(err) });
  }
};

// Get all
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.json(categories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get by ID
exports.getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    return res.json(cat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const file = getUploadedFile(req);
    const existing = await Category.findById(id);
    if (!existing) return res.status(404).json({ message: "Category not found" });

    const { categoryName, DeptCode, description, categoryItems } = req.body;

    const updates = {};
    if (categoryName) updates.categoryName = categoryName;
    if (DeptCode) updates.DeptCode = DeptCode;
    if (description !== undefined) updates.description = description;
    if (categoryItems !== undefined) updates.categoryItems = parseSubcategories(categoryItems);

    if (file) {
      if (existing.imagePath) deleteFileIfExists(existing.imagePath);
      updates.imagePath = toFullImageURL(req, `uploads/${file.filename}`);
    }

    const updated = await Category.findByIdAndUpdate(id, updates, { new: true });
    return res.json({ message: "Category updated", category: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message || String(err) });
  }
};

// Delete
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Category.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: "Category not found" });
    if (removed.imagePath) deleteFileIfExists(removed.imagePath);
    return res.json({ message: "Category deleted", id: removed._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
