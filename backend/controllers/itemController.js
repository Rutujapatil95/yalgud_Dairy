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
    const body =
      req.body && typeof req.body === "object" ? { ...req.body } : {};

    if (!Object.keys(body).length) {
      return res.status(400).json({
        ok: false,
        message: "Please provide filters in the request body",
      });
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

    console.log(
      "Applied query:",
      JSON.stringify(query),
      "SortBy:",
      sortBy,
      "Order:",
      order
    );

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
      sort: sortBy
        ? { field: sortBy, order: order === 1 ? "asc" : "desc" }
        : null,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error("getFilteredItems error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

// ✅ Get single item by ItemCode
async function getItemByItemCode(req, res) {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res
        .status(500)
        .json({ ok: false, message: "Database not connected" });
    }

    const collectionName = req.query.collection || "ItemMaster";
    const itemCode = req.params.itemCode;

    if (!itemCode) {
      return res
        .status(400)
        .json({ ok: false, message: "ItemCode is required" });
    }

    const db = mongoose.connection.db;
    const coll = db.collection(collectionName);

    // 👇 Try matching as both number and string
    const query = {
      $or: [{ ItemCode: Number(itemCode) }, { ItemCode: itemCode }],
    };

    const item = await coll.findOne(query);

    if (!item) {
      return res.status(404).json({ ok: false, message: "Item not found" });
    }

    res.json(item); // ✅ direct full item response (not wrapped)
  } catch (err) {
    console.error("getItemByItemCode error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

async function getItemsByItemCategoryCode(req, res) {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res
        .status(500)
        .json({ ok: false, message: "Database not connected" });
    }

    const collectionName = req.query.collection || "ItemMaster";
    const categoryCode = req.params.categoryCode;

    if (!categoryCode) {
      return res
        .status(400)
        .json({ ok: false, message: "ItemCategoryCode is required" });
    }

    const db = mongoose.connection.db;
    const coll = db.collection(collectionName);

    // 👇 Match number or string type to handle both cases
    const query = {
      $or: [
        { ItemCategoryCode: Number(categoryCode) },
        { ItemCategoryCode: categoryCode },
      ],
    };

    const items = await coll.find(query).toArray();

    if (!items.length) {
      return res
        .status(404)
        .json({
          ok: false,
          message: "No items found for this ItemCategoryCode",
        });
    }

    // ✅ Directly return full array of items (no wrapper)
    res.json(items);
  } catch (err) {
    console.error("getItemsByItemCategoryCode error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

// ✅ Get one unique item per ItemCategoryCode
async function getUniqueItemsByCategoryCode(req, res) {
  try {
    const { ItemCategoryCode } = req.body || {};

    // ✅ Build base query
    const query = {};
    if (ItemCategoryCode !== undefined && ItemCategoryCode !== "") {
      // handle both single and multiple codes
      if (Array.isArray(ItemCategoryCode)) {
        query.ItemCategoryCode = { $in: ItemCategoryCode };
      } else {
        query.ItemCategoryCode = ItemCategoryCode;
      }
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not ready yet.");

    const itemColl = db.collection("ItemMaster");

    // ✅ Aggregate to group by ItemCategoryCode and pick one document
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: "$ItemCategoryCode",
          item: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$item" },
      },
      {
        $project: {
          _id: 0,
          ItemCode: 1,
          ItemName: 1,
          ItemNameEnglish: 1,
          ItemCategoryCode: 1,
          DeptCode: 1,
          Status: 1,
          ItemType: 1,
        },
      },
    ];

    const docs = await itemColl.aggregate(pipeline).toArray();

    return res.json({
      ok: true,
      message: `✅ Found ${docs.length} unique ItemCategoryCode entries`,
      count: docs.length,
      data: docs,
    });
  } catch (err) {
    console.error("❌ Error in getUniqueItemsByCategoryCode:", err);
    return res.status(500).json({
      ok: false,
      message: err.message || "Failed to fetch unique category items",
    });
  }
}

// ✅ One unique item per ItemCategoryCode, grouped by DeptCode
async function getUniqueItemsByDept(req, res) {
  try {
    const { DeptCode } = req.body || {};

    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not ready yet.");
    const itemColl = db.collection("ItemMaster");

    // ✅ Build query — support both single or multiple departments
    const query = { Status: 0, ItemType: 2 }; 
    if (DeptCode !== undefined && DeptCode !== "") {
      if (Array.isArray(DeptCode)) {
        query.DeptCode = { $in: DeptCode.map(Number) };
      } else {
        query.DeptCode = Number(DeptCode);
      }
    }

    // ✅ Aggregate: group by DeptCode + ItemCategoryCode
    const pipeline = [
      { $match: query }, // 👈 filter applied here
      {
        $group: {
          _id: {
            DeptCode: "$DeptCode",
            ItemCategoryCode: "$ItemCategoryCode",
          },
          item: { $first: "$$ROOT" }, // pick first item in each category per dept
        },
      },
      {
        $replaceRoot: { newRoot: "$item" }, // flatten result
      },
      {
        $sort: { DeptCode: 1, ItemCategoryCode: 1 }, // sort by dept and category
      },
      {
        $project: {
          _id: 0,
          ItemCode: 1,
          ItemName: 1,
          ItemNameEnglish: 1,
          ItemCategoryCode: 1,
          DeptCode: 1,
          Status: 1,
          ItemType: 1,
        },
      },
    ];

    const docs = await itemColl.aggregate(pipeline).toArray();

    // ✅ Group results department-wise for clearer structure
    const grouped = docs.reduce((acc, item) => {
      const dept = item.DeptCode || "Unknown";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(item);
      return acc;
    }, {});

    return res.json({
      ok: true,
      message: `✅ Found ${docs.length} unique category items (Status=0, ItemType=2) grouped by department`,
      count: docs.length,
      data: grouped,
    });
  } catch (err) {
    console.error("❌ Error in getUniqueItemsByDept:", err);
    return res.status(500).json({
      ok: false,
      message: err.message || "Failed to fetch department-wise category items",
    });
  }
}


module.exports = {
  getAllItems,
  getFilteredItems,
  getItemByItemCode,
  getItemsByItemCategoryCode,
  getUniqueItemsByCategoryCode,
  getUniqueItemsByDept,
};
