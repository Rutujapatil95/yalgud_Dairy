const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/NewCategoryController");
const upload = require("../middleware/upload");

// Create category with image upload
router.post("/create", upload.single("image"), categoryController.createCategory);

// Get all categories
router.get("/", categoryController.getAllCategories);

// Get single category
router.get("/:id", categoryController.getCategoryById);

// Update category
router.put("/:id", upload.single("image"), categoryController.updateCategory);

// Delete category
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
