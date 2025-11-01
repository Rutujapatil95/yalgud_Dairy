const Category = require("../models/Category");

// ✅ Create Category
exports.createCategory = async (req, res) => {
  try {
    const {
      DeptCode, // ✅ Accept DeptCode from frontend
      groupTitleEnglish,
      groupTitleMarathi,
      nameEnglish,
      nameMarathi,
      descriptionEnglish,
      descriptionMarathi,
      page,
      status,
    } = req.body;

    // ✅ Basic validation
    if (!groupTitleEnglish || !groupTitleMarathi || !nameEnglish || !nameMarathi) {
      return res.status(400).json({
        error:
          "groupTitleEnglish, groupTitleMarathi, nameEnglish, and nameMarathi are required",
      });
    }

    // ✅ Handle image upload
    const image = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    // ✅ Assign DeptCode (from body or auto-generate)
    let finalDeptCode;
    if (DeptCode) {
      finalDeptCode = parseInt(DeptCode);
    } else {
      // Auto-generate DeptCode if not sent (next number)
      const lastCategory = await Category.findOne().sort({ DeptCode: -1 });
      finalDeptCode = lastCategory ? lastCategory.DeptCode + 1 : 1;
    }

    // ✅ Create new category
    const category = await Category.create({
      DeptCode: finalDeptCode,
      groupTitleEnglish: groupTitleEnglish.trim(),
      groupTitleMarathi: groupTitleMarathi.trim(),
      nameEnglish: nameEnglish.trim(),
      nameMarathi: nameMarathi.trim(),
      descriptionEnglish: descriptionEnglish || "",
      descriptionMarathi: descriptionMarathi || "",
      page: page || "",
      status: (status || "active").trim(),
      image,
    });

    res.status(201).json({
      message: "✅ Category created successfully",
      category,
    });
  } catch (error) {
    console.error("❌ Error creating category:", error);
    res.status(500).json({ message: "Error creating category", error });
  }
};

// ✅ Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// ✅ Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

// ✅ Update category
exports.updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body };

    // ✅ Update image if new file uploaded
    if (req.file) {
      updates.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "✅ Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

// ✅ Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "🗑️ Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};
