// backend/routes/filterRoutes.js
const express = require("express");
const router = express.Router();

const { getItemsByStatus } = require("../controllers/filtercontroller");

// ✅ Define POST /api/status endpoint
router.post("/status", getItemsByStatus);

module.exports = router;
