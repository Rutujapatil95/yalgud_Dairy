// routes/itemRoutes.js
const express = require("express");
const router = express.Router();

// <- Correct import path: "../controllers/..." (plural)
const { getAllItems, getFilteredItems } = require("../controllers/itemController");

// Route to get all items
router.get("/items", getAllItems);

// Route to get filtered items (POST)
router.post("/filter", getFilteredItems);

module.exports = router;