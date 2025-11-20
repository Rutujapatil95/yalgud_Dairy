// backend/controllers/filtercontroller.js
const mongoose = require("mongoose");

// Optional save helper
let saveFilteredItems = null;
try {
  const mod = require("../models/filteredItemModel");
  saveFilteredItems =
    mod && mod.saveFilteredItems ? mod.saveFilteredItems : null;
} catch (e) {
  console.warn(
    "⚠️ Warning: filteredItemModel not found. Skipping saveFilteredItems step."
  );
}

/**
 * POST /api/status
 * Example body:
 * {
 *   "Status": 0,
 *   "ItemType": 2,
 *   "DeptCode": [37,34,38,39],
 *   "GSTRATECODE": 2
 * }
 */
async function getItemsByStatus(req, res) {
  try {
    const { Status, ItemType, DeptCode, GSTRATECODE, ItemCategoryCode } =
      req.body || {};

    // Build dynamic query
    const query = {};
    if (Status !== undefined && Status !== "") query.Status = Status;
    if (ItemType !== undefined && ItemType !== "") query.ItemType = ItemType;
    if (GSTRATECODE !== undefined && GSTRATECODE !== "")
      query.GSTRATECODE = GSTRATECODE;
    if (ItemCategoryCode !== undefined && ItemCategoryCode !== "")
      query.ItemCategoryCode = ItemCategoryCode;

    // ✅ DeptCode supports both single value and array
    if (Array.isArray(DeptCode)) {
      query.DeptCode = { $in: DeptCode };
    } else if (DeptCode !== undefined && DeptCode !== "") {
      query.DeptCode = DeptCode;
    }

    console.log("📋 Filter Query:", JSON.stringify(query));

    // ✅ Get native db from mongoose connection
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not ready yet.");

    const itemColl = db.collection("ItemMaster");
    const deptColl = db.collection("DeptMaster");

    // ✅ Fetch filtered items
    const docs = await itemColl
      .find(query, {
        projection: { _id: 0, ItemCode: 1, ItemName: 1, ItemCategoryCode: 1 },
      })
      .toArray();

    const filteredCount = docs.length;

    // ✅ Optional save step
    if (filteredCount > 0 && typeof saveFilteredItems === "function") {
      try {
        await saveFilteredItems(docs);
      } catch (saveErr) {
        console.warn("⚠️ Failed to save filtered items:", saveErr.message);
      }
    }

    // ✅ Fetch DeptMaster entries with Flag = 1
    const deptDocs = await deptColl
      .find({ $or: [{ Flag: 1 }, { flag: 1 }] })
      .toArray();

    return res.json({
      message: `✅ Filtered data fetched${filteredCount ? " and stored" : ""}`,
      filteredCount,
      data: docs,
      deptMasters: Array.isArray(deptDocs) ? deptDocs : [],
    });
  } catch (err) {
    console.error("❌ Error in getItemsByStatus:", err);
    return res.status(500).json({
      error: "Failed to fetch or store ItemMaster data",
      details: err.message || err.toString(),
    });
  }
}

module.exports = {
  getItemsByStatus,
};
