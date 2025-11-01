// controllers/itemController.js
const mongoose = require("mongoose");

/**
 * Converts numeric or boolean-like strings to proper JS types.
 */
function coerceValue(val) {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  return val;
}

/**
 * Normalize incoming keys to DB field names (case-insensitive).
 * Add more mappings here if your DB uses different names.
 */
function normalizeKey(key) {
  if (!key || typeof key !== "string") return key;
  const k = key.trim().toLowerCase();
  const map = {
    deptcode: "DeptCode",
    dept: "DeptCode",
    status: "Status",
    itemtype: "ItemType",
    itemcode: "ItemCode",
    itemname: "ItemName",
    itemcategorycode: "ItemCategoryCode",
    // add other mappings if needed
  };
  return map[k] || key;
}

/**
 * GET /api/sorting/items
 */
async function getAllItems(req, res) {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res
        .status(500)
        .json({ ok: false, message: "Database not connected" });
    }

    const collectionName = req.query.collection || "ItemMaster";
    const limit = parseInt(req.query.limit, 10) || 0;
    const db = mongoose.connection.db;
    const coll = db.collection(collectionName);

    const items = await (limit > 0
      ? coll.find({}).limit(limit).toArray()
      : coll.find({}).toArray());

    res.json({
      ok: true,
      collection: collectionName,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error("getAllItems error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

/**
 * POST /api/sorting/filter
 *
 * Accepts body with any filter keys (case-insensitive), e.g.:
 * { "Status":0, "Deptcode":2, "ItemType":2 }
 *
 * Optional sorting still supported via sortBy/order if provided.
 */
async function getFilteredItems(req, res) {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res
        .status(500)
        .json({ ok: false, message: "Database not connected" });
    }

    const collectionName = req.query.collection || "ItemMaster";
    const limit = parseInt(req.query.limit, 10) || 0;
    // Copy body so we can delete sort params from filters
    const body = req.body && typeof req.body === "object" ? { ...req.body } : {};

    if (!Object.keys(body).length) {
      return res
        .status(400)
        .json({ ok: false, message: "Please provide filters in the request body" });
    }

    // Extract sorting options (if any)
    let sortBy = undefined;
    let order = 1; // 1 asc, -1 desc

    if (body.sortBy) {
      sortBy = body.sortBy;
      delete body.sortBy;
    }
    if (body.order) {
      const o = `${body.order}`.toLowerCase();
      order = o === "desc" ? -1 : 1;
      delete body.order;
    }
    // convenience flag: sortByItemType: true
    if (body.sortByItemType) {
      sortBy = "ItemType";
      delete body.sortByItemType;
    }

    // Build query from remaining keys (normalize keys to DB field names)
    const query = {};
    Object.keys(body).forEach((incomingKey) => {
      const rawVal = body[incomingKey];
      if (rawVal === undefined || rawVal === null || rawVal === "") return;

      const dbKey = normalizeKey(incomingKey);
      const value = coerceValue(rawVal);
      query[dbKey] = Array.isArray(value)
        ? { $in: value.map(coerceValue) }
        : value;
    });

    console.log("Applied query:", JSON.stringify(query), "SortBy:", sortBy, "Order:", order);

    const db = mongoose.connection.db;
    const coll = db.collection(collectionName);

    // Build cursor with optional sort
    let cursor = coll.find(query);
    if (sortBy) {
      const sortObj = {};
      sortObj[String(sortBy)] = order;
      cursor = cursor.sort(sortObj);
    } else if (sortBy === undefined) {
      // no default change — preserve your original behavior
      // If you want to auto-sort by ItemType when DeptCode present, uncomment:
      // if (query.DeptCode !== undefined) cursor = cursor.sort({ ItemType: 1 });
    }

    if (limit > 0) cursor = cursor.limit(limit);

    const items = await cursor.toArray();

    return res.json({
      ok: true,
      collection: collectionName,
      appliedFilters: query,
      sort: sortBy ? { field: sortBy, order: order === 1 ? "asc" : "desc" } : null,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error("getFilteredItems error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = { getAllItems, getFilteredItems };
