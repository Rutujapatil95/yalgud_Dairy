// routes/genericRoutes.js
const express = require("express");
const router = express.Router();

// Require controller and validate exported functions
const controller = require("../controllers/genericController");

// Helpful runtime checks — these will throw a clear error rather than the obscure TypeError
if (!controller || typeof controller !== "object") {
  throw new Error("genericController did not export an object. Check path ../controllers/genericController");
}
if (typeof controller.getAll !== "function") {
  throw new Error("genericController.getAll is not a function — check your controller file and module.exports");
}
if (typeof controller.getFiltered !== "function") {
  throw new Error("genericController.getFiltered is not a function — check your controller file and module.exports");
}

// GET all: optionally pass ?collection=ItemMaster&limit=100&sortBy=ItemType&order=asc&populate=franchise,owner
router.get("/data", controller.getAll);

// POST filter: body contains filters (case-insensitive keys)
router.post("/data/filter", controller.getFiltered);

module.exports = router;