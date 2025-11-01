const mongoose = require("mongoose");

function coerceValue(val) {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(coerceValue);
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (trimmed === "") return "";

  if (/,/.test(trimmed) && !/[^0-9,\s.-]/.test(trimmed)) {
    return trimmed.split(",").map((s) => coerceValue(s));
  }
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  return trimmed;
}

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

    entryno: "EntryNo",
    trdate: "TrDate",
    remark: "Remark",
    salesrate: "SalesRate",
    comission: "Comission",
    agentrate: "AgentRate",
    agentrate1: "AgentRate1",
    itemcategorycode: "ItemCategorycode",
    source: "source",
  };

  return map[k] || key;
}

async function getAll(req, res) {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res
        .status(500)
        .json({ ok: false, message: "Database not connected" });
    }

    const collectionName = req.query.collection || "ItemMaster";
    const limit = parseInt(req.query.limit, 10) || 0;
    const sortBy = req.query.sortBy;
    const order =
      String(req.query.order || "asc").toLowerCase() === "desc" ? -1 : 1;
    const populate = req.query.populate
      ? String(req.query.populate)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const db = mongoose.connection.db;

    let model = null;
    try {
      if (mongoose.modelNames().includes(collectionName)) {
        model = mongoose.model(collectionName);
      }
    } catch {
      model = null;
    }

    if (model) {
      let query = model.find({});
      if (sortBy) {
        const sortObj = {};
        sortObj[normalizeKey(sortBy)] = order;
        query = query.sort(sortObj);
      }
      if (limit > 0) query = query.limit(limit);
      if (populate.length)
        populate.forEach((p) => {
          query = query.populate(p);
        });
      const docs = await query.lean().exec();
      return res.json({
        ok: true,
        collection: collectionName,
        count: docs.length,
        data: docs,
      });
    } else {
      // fallback to raw collection
      const coll = db.collection(collectionName);
      let cursor = coll.find({});
      if (sortBy) {
        const sortObj = {};
        sortObj[String(sortBy)] = order;
        cursor = cursor.sort(sortObj);
      }
      if (limit > 0) cursor = cursor.limit(limit);
      const docs = await cursor.toArray();
      return res.json({
        ok: true,
        collection: collectionName,
        count: docs.length,
        data: docs,
      });
    }
  } catch (err) {
    console.error("getAll error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

async function getFiltered(req, res) {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res
        .status(500)
        .json({ ok: false, message: "Database not connected" });
    }

    const collectionName = req.query.collection || "ItemMaster";
    const limitQuery = parseInt(req.query.limit, 10) || 0;
    const bodyLimit =
      req.body && req.body.limit ? parseInt(req.body.limit, 10) : 0;
    const limit = bodyLimit || limitQuery || 0;

    const populate = req.query.populate
      ? String(req.query.populate)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const body =
      req.body && typeof req.body === "object" ? { ...req.body } : {};

    let sortBy = undefined;
    let order = 1;
    if (body.sortBy) {
      sortBy = body.sortBy;
      delete body.sortBy;
    }
    if (body.order) {
      order = String(body.order).toLowerCase() === "desc" ? -1 : 1;
      delete body.order;
    }
    if (body.limit) delete body.limit;

    const query = {};
    Object.keys(body).forEach((incomingKey) => {
      const rawVal = body[incomingKey];
      if (rawVal === undefined || rawVal === null || rawVal === "") return;

      const dbKey = normalizeKey(incomingKey);
      const value = coerceValue(rawVal);

      if (Array.isArray(value)) {
        query[dbKey] = { $in: value.map(coerceValue) };
      } else {
        query[dbKey] = value;
      }
    });

    console.log(
      "Applied query:",
      JSON.stringify(query),
      "sortBy:",
      sortBy,
      "order:",
      order,
      "collection:",
      collectionName
    );

    const db = mongoose.connection.db;

    let model = null;
    try {
      if (mongoose.modelNames().includes(collectionName)) {
        model = mongoose.model(collectionName);
      }
    } catch {
      model = null;
    }

    if (model) {
      let q = model.find(query);
      if (sortBy) {
        const sortObj = {};
        sortObj[normalizeKey(sortBy)] = order;
        q = q.sort(sortObj);
      }
      if (limit > 0) q = q.limit(limit);
      if (populate.length)
        populate.forEach((p) => {
          q = q.populate(p);
        });
      const docs = await q.lean().exec();
      return res.json({
        ok: true,
        collection: collectionName,
        appliedFilters: query,
        sort: sortBy
          ? { field: sortBy, order: order === 1 ? "asc" : "desc" }
          : null,
        count: docs.length,
        data: docs,
      });
    } else {
      const coll = db.collection(collectionName);
      let cursor = coll.find(query);
      if (sortBy) {
        const sortObj = {};
        sortObj[String(sortBy)] = order;
        cursor = cursor.sort(sortObj);
      }
      if (limit > 0) cursor = cursor.limit(limit);
      const docs = await cursor.toArray();
      return res.json({
        ok: true,
        collection: collectionName,
        appliedFilters: query,
        sort: sortBy
          ? { field: sortBy, order: order === 1 ? "asc" : "desc" }
          : null,
        count: docs.length,
        data: docs,
      });
    }
  } catch (err) {
    console.error("getFiltered error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = { getAll, getFiltered };
