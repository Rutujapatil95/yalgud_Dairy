const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const { sql, sqlConfig, mongoConfig } = require("../dbConfig");

async function migrateTableToMongo(tableName, customQuery = null) {
  let sqlPool;
  let mongoClient;

  try {
    console.log(`\n🚀 Starting migration for table: ${tableName}`);
    sqlPool = await sql.connect(sqlConfig);

    const columnQuery = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION
    `;
    const columnResult = await sqlPool.request().query(columnQuery);
    const columns = columnResult.recordset.map((col) => col.COLUMN_NAME);

    const dataQuery = customQuery || `SELECT * FROM ${tableName}`;
    const dataResult = await sqlPool.request().query(dataQuery);

    const documents = dataResult.recordset.map((row) => {
      const doc = {};
      columns.forEach((col) => (doc[col] = row[col]));
      doc.migratedAt = new Date();
      doc.source = `SQL Server ERPData10 → ${tableName}`;
      return doc;
    });

    mongoClient = new MongoClient(mongoConfig.url);
    await mongoClient.connect();
    const db = mongoClient.db(mongoConfig.database);
    const collection = db.collection(tableName);

    await collection.deleteMany({});
    await collection.insertMany(documents);

    console.log(`🎉 ${documents.length} documents inserted into ${tableName}`);
  } catch (err) {
    console.error(`❌ Migration failed for ${tableName}:`, err);
  } finally {
    if (sqlPool) await sqlPool.close();
    if (mongoClient) await mongoClient.close();
  }
}

// =======================
// 🚀 MIGRATE ALL TABLES
// =======================
async function migrateAllTables() {
  const tables = ["AgentMaster", "ItemMaster", "SalesRateChart"];
  for (const table of tables) await migrateTableToMongo(table);

  const deptQuery = `SELECT * FROM DeptMaster WHERE Flag = 1 AND DeptCode NOT IN (11, 15)`;
  await migrateTableToMongo("DeptMaster", deptQuery);

  console.log("✅ All tables migrated successfully!");
}

// =======================
// 📦 API ROUTES
// =======================

// ===== GET: ALL AGENTS =====
router.get("/agents", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);
    const agents = await db.collection("AgentMaster").find({}).toArray();

    res.json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    console.error("❌ Error fetching agents:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== ✅ NEW: GET SINGLE AGENT BY AgentCode =====
router.get("/:agentCode", async (req, res) => {
  let client;
  try {
    const { agentCode } = req.params;
    console.log("Agent request received for:", agentCode);

    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    const agent = await db.collection("AgentMaster").findOne({
      $or: [
        { AgentCode: Number(agentCode) },
        { AgentCode: agentCode },
      ],
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: `No agent found for code ${agentCode}`,
      });
    }

    res.json({ success: true, data: agent });
  } catch (err) {
    console.error("Error fetching agent:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== GET: DEPARTMENTS =====
router.get("/departments", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);
    const depts = await db.collection("DeptMaster").find({}).toArray();

    res.json({ success: true, count: depts.length, data: depts });
  } catch (err) {
    console.error("❌ Error fetching departments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== GET: PRODUCTS =====
router.get("/products", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);
    const products = await db.collection("ItemMaster").find({}).toArray();

    if (!products.length)
      return res
        .status(404)
        .json({ success: false, message: "No products found", data: [] });

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== GET: RATES =====
router.get("/rates", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);
    const rates = await db.collection("SalesRateChart").find({}).toArray();

    if (!rates.length)
      return res
        .status(404)
        .json({ success: false, message: "No rates found", data: [] });

    res.json({ success: true, count: rates.length, data: rates });
  } catch (err) {
    console.error("❌ Error fetching rates:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== GET: PRODUCTS WITH RATES =====
router.get("/products-with-rates", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    const items = await db.collection("ItemMaster").find({}).toArray();
    const rates = await db.collection("SalesRateChart").find({}).toArray();

    const merged = items.map((item) => {
      const rate = rates.find((r) => r.ItemCode === item.ItemCode);
      return {
        ...item,
        SalesRate: rate ? rate.SalesRate ?? null : null,
        AgentRate: rate ? rate.AgentRate ?? null : null,
        Comission: rate ? rate.Comission ?? null : null,
        Remark: rate ? rate.Remark ?? null : null,
        TrDate: rate ? rate.TrDate ?? null : null,
      };
    });

    res.json({ success: true, data: merged });
  } catch (err) {
    console.error("❌ Error merging product rates:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== GET: PRODUCTS SORTED WITH FILTER =====
router.get("/products_sorted", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    const { DeptCode, ItemCategoryCode } = req.query;

    const filter = { Status: 0, ItemType: 2 };
    if (DeptCode && !isNaN(Number(DeptCode))) {
      filter.DeptCode = Number(DeptCode);
    }
    if (ItemCategoryCode && !isNaN(Number(ItemCategoryCode))) {
      filter.ItemCategoryCode = Number(ItemCategoryCode);
    }

    const items = await db.collection("ItemMaster").find(filter).toArray();
    const rates = await db.collection("SalesRateChart").find({}).toArray();

    const merged = items.map((item) => {
      const rate = rates.find((r) => r.ItemCode === item.ItemCode);
      return {
        ItemCode: item.ItemCode,
        ItemCategoryCode: item.ItemCategoryCode,
        ItemNameEnglish: item.ItemNameEnglish,
        SalesRate: rate ? rate.SalesRate ?? null : null,
        AgentRate: rate ? rate.AgentRate ?? null : null,
      };
    });

    res.status(200).json({
      success: true,
      total: merged.length,
      data: merged,
    });
  } catch (error) {
    console.error("Error in /products_sorted:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== GET: UNIQUE ITEM CATEGORY CODES =====
router.get("/unique-categories", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    const { DeptCode } = req.query;
    const filter = { Status: 0 };
    if (DeptCode && !isNaN(Number(DeptCode))) {
      filter.DeptCode = Number(DeptCode);
    }

    const uniqueCategories = await db
      .collection("ItemMaster")
      .distinct("ItemCategoryCode", filter);

    res.status(200).json({
      success: true,
      total: uniqueCategories.length,
      data: uniqueCategories,
    });
  } catch (error) {
    console.error("Error fetching unique ItemCategoryCode:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== POST: PRODUCTS BY ITEMCODES =====
router.post("/products-with-rates/by-itemcodes", async (req, res) => {
  let client;
  try {
    const { itemCodes } = req.body;
    if (!Array.isArray(itemCodes) || itemCodes.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "ItemCodes array required" });
    }

    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    const numericCodes = itemCodes.map((code) => Number(code));

    const items = await db
      .collection("ItemMaster")
      .find({ ItemCode: { $in: numericCodes } })
      .toArray();

    const rates = await db
      .collection("SalesRateChart")
      .find({ ItemCode: { $in: numericCodes } })
      .toArray();

    const merged = items.map((item) => {
      const rate = rates.find((r) => r.ItemCode === item.ItemCode);
      return {
        ...item,
        SalesRate: rate ? rate.SalesRate ?? null : null,
        AgentRate: rate ? rate.AgentRate ?? null : null,
        Comission: rate ? rate.Comission ?? null : null,
        Remark: rate ? rate.Remark ?? null : null,
        TrDate: rate ? rate.TrDate ?? null : null,
      };
    });

    res.json({ success: true, count: merged.length, data: merged });
  } catch (err) {
    console.error("❌ Error fetching products by ItemCodes:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  } finally {
    if (client) await client.close();
  }
});

module.exports = { router, migrateAllTables };
