// routes/itemRoutes.js
const express = require("express");
const router = express.Router();

// <- Correct import path: "../controllers/..." (plural)
const {
  getAllItems,
  getFilteredItems,
  getItemByItemCode,
  getItemsByItemCategoryCode,
  getUniqueItemsByCategoryCode,
  getUniqueItemsByDept,
} = require("../controllers/itemController");

// Route to get all items
router.get("/items", getAllItems);

// Route to get filtered items (POST)
router.post("/filter", getFilteredItems);
router.get("/item/:itemCode", getItemByItemCode);
router.get("/category/:categoryCode", getItemsByItemCategoryCode);
router.post("/unique-category", getUniqueItemsByCategoryCode);
router.post("/unique-dept", getUniqueItemsByDept);

module.exports = router;
