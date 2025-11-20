const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const { sql, sqlConfig, mongoConfig } = require("../dbConfig");

// =======================
// 🚀 FUNCTION: MIGRATE SINGLE TABLE
// =======================
async function migrateTableToMongo(tableName, customQuery = null) {
  let sqlPool;
  let mongoClient;

  try {
    console.log(`\n🚀 Starting migration for table: ${tableName}`);
    sqlPool = await sql.connect(sqlConfig);

    // Get column names
    const columnQuery = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION
    `;
    const columnResult = await sqlPool.request().query(columnQuery);
    const columns = columnResult.recordset.map((col) => col.COLUMN_NAME);

    // Get table data
    const dataQuery = customQuery || `SELECT * FROM ${tableName}`;
    const dataResult = await sqlPool.request().query(dataQuery);

    // Convert rows to MongoDB documents
    const documents = dataResult.recordset.map((row) => {
      const doc = {};
      columns.forEach((col) => (doc[col] = row[col]));
      doc.migratedAt = new Date();
      doc.source = `SQL Server ERPData10 → ${tableName}`;
      return doc;
    });

    // Connect to Mongo and insert
    mongoClient = new MongoClient(mongoConfig.url);
    await mongoClient.connect();
    const db = mongoClient.db(mongoConfig.database);
    const collection = db.collection(tableName);

    await collection.deleteMany({});
    if (documents.length > 0) {
      await collection.insertMany(documents);
      console.log(`🎉 ${documents.length} documents inserted into ${tableName}`);
    } else {
      console.log(`⚠️ No records found in ${tableName} to migrate.`);
    }
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
  const tables = [
    "AgentMaster",
    "ItemMaster",
    "SalesRateChart",
    "SalesRouteMaster",
    "SupervisorMaster", // ✅ New table added
  ];

  for (const table of tables) {
    await migrateTableToMongo(table);
  }

  // Custom filtered department migration
  const deptQuery = `
    SELECT * FROM DeptMaster
    WHERE Flag = 1 AND DeptCode NOT IN (11, 15)
  `;
  await migrateTableToMongo("DeptMaster", deptQuery);

  console.log("✅ All tables migrated successfully including SupervisorMaster!");
}

// =======================
// 📦 API ROUTES
// =======================

// ===== ✅ DEFAULT ROOT ROUTE (GET ALL AGENTS) =====
router.get("/", async (req, res) => {
  let client;
  try {
    console.log("📩 Request received: GET /api/masters/");
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);
    const agents = await db.collection("AgentMaster").find({}).toArray();
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ success: false, message: "Failed to fetch agents" });
  } finally {
    if (client) await client.close();
  }
});

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

// ===== ✅ GET: SINGLE AGENT WITH ROUTE + ITEM INFO =====
router.get("/:agentCode", async (req, res) => {
  let client;
  try {
    const { agentCode } = req.params;
    const { itemCode, quantity } = req.query;
    console.log("Agent request received for:", agentCode, "Item:", itemCode);

    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    const agent = await db.collection("AgentMaster").findOne({
      $or: [{ AgentCode: Number(agentCode) }, { AgentCode: agentCode }],
    });
    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: `No agent found for code ${agentCode}` });
    }

    const route = await db
      .collection("SalesRouteMaster")
      .findOne({ RouteCode: agent.SalesRouteCode });

    let item = null;
    if (itemCode) {
      item = await db.collection("ItemMaster").findOne({ ItemCode: Number(itemCode) });
    }

    const response = {
      AgentCode: agent.AgentCode,
      AgentName: agent.AgentName,
      SalesRouteCode: agent.SalesRouteCode,
      RouteName: route?.RouteName || "N/A",
      VehichleNo: route?.VehichleNo || "N/A",
      ItemCode: item?.ItemCode || Number(itemCode) || null,
      ItemName: item?.ItemName || null,
      Quantity: Number(quantity) || 0,
    };

    res.json({ success: true, data: response });
  } catch (err) {
    console.error("Error fetching agent with details:", err);
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
      return res.status(404).json({ success: false, message: "No products found", data: [] });

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
      return res.status(404).json({ success: false, message: "No rates found", data: [] });

    res.json({ success: true, count: rates.length, data: rates });
  } catch (err) {
    console.error("❌ Error fetching rates:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== GET: SALES ROUTES =====
router.get("/sales-routes", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);
    const routes = await db.collection("SalesRouteMaster").find({}).toArray();

    if (!routes.length)
      return res.status(404).json({ success: false, message: "No sales routes found", data: [] });

    res.json({ success: true, count: routes.length, data: routes });
  } catch (err) {
    console.error("❌ Error fetching SalesRouteMaster:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== ✅ GET: SUPERVISORS =====
router.get("/supervisors", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);
    const supervisors = await db.collection("SupervisorMaster").find({}).toArray();

    if (!supervisors.length)
      return res.status(404).json({ success: false, message: "No supervisors found", data: [] });

    res.json({ success: true, count: supervisors.length, data: supervisors });
  } catch (err) {
    console.error("❌ Error fetching SupervisorMaster:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ===== EXPORT =====
module.exports = { router, migrateAllTables };
