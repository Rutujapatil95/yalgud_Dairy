const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const categoryController = require("../controllers/categoryController");

// ============================
// ⚙️ Multer Configuration
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // ✅ uploads folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// ============================
// 🧩 CRUD Routes
// ============================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // ✅ Save relative path
    req.body.image = req.file ? `/uploads/${req.file.filename}` : null;
    await categoryController.createCategory(req, res);
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Image upload failed", error: err.message });
  }
});

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", upload.single("image"), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
