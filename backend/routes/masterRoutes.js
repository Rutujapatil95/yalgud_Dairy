const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const { sql, sqlConfig, mongoConfig } = require("../dbConfig");

// ✅ Helper: Connect to MongoDB
async function connectToMongo() {
  const client = new MongoClient(mongoConfig.url);
  await client.connect();
  const db = client.db(mongoConfig.database);
  return { client, db };
}

// ✅ Helper: Migrate a SQL table into MongoDB
async function migrateTableToMongo(tableName, customQuery = null) {
  let sqlPool;
  let mongoClient;
  try {
    console.log(`🚀 Starting migration for table: ${tableName}`);
    sqlPool = await sql.connect(sqlConfig);

    const columnQuery = `
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
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
    if (documents.length > 0) {
      await collection.insertMany(documents);
      console.log(`✅ ${documents.length} records inserted into ${tableName}`);
    } else {
      console.log(`⚠️ No data found for ${tableName}`);
    }
  } catch (err) {
    console.error(`❌ Migration failed for ${tableName}:`, err);
  } finally {
    if (sqlPool) await sqlPool.close();
    if (mongoClient) await mongoClient.close();
  }
}

// ✅ Bulk migration for all tables
async function migrateAllTables() {
  const tables = [
    "AgentMaster",
    "ItemMaster",
    "SalesRateChart",
    "SalesRouteMaster",
  ];

  for (const table of tables) {
    await migrateTableToMongo(table);
  }

  const deptQuery = `SELECT * FROM DeptMaster WHERE Flag = 1 AND DeptCode NOT IN (11, 15)`;
  await migrateTableToMongo("DeptMaster", deptQuery);
  console.log("🎉 All tables migrated successfully!");
}

/* ==============================================
   🔹 API ROUTES
============================================== */

// ✅ 1️⃣ Get distinct Agent Codes (used by Dashboard)
router.get("/agent-codes", async (req, res) => {
  let client;
  try {
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    // Get unique agent codes from Orders collection
    const codes = await db.collection("Orders").distinct("agentCode");
    res.json(codes);
  } catch (err) {
    console.error("❌ Error fetching agent codes:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ✅ 2️⃣ Get all agents
router.get("/agents", async (req, res) => {
  let client;
  try {
    ({ client, db } = await connectToMongo());
    const agents = await db.collection("AgentMaster").find({}).toArray();
    res.json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    console.error("❌ Error fetching agents:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ✅ 3️⃣ Get single agent by code
const uri = "mongodb://localhost:27017"; // your MongoDB URI
const dbName = "ERPData10";

router.get("/agents/:agentCode?", async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const agentCode = req.params.agentCode;
    const matchStage = agentCode
      ? { $match: { AgentCode: Number(agentCode) } } // single agent
      : { $match: {} }; // all agents

    const agents = await db
      .collection("AgentMaster")
      .aggregate([
        matchStage,

        // Join with SalesRouteMaster
        {
          $lookup: {
            from: "SalesRouteMaster",
            localField: "SalesRouteCode",
            foreignField: "RouteCode",
            as: "route",
          },
        },
        { $unwind: { path: "$route", preserveNullAndEmptyArrays: true } },

        // Join with SupervisorMaster
        {
          $lookup: {
            from: "SupervisorMaster",
            localField: "route.SupervisorCode",
            foreignField: "SupervisorCode",
            as: "supervisor",
          },
        },
        { $unwind: { path: "$supervisor", preserveNullAndEmptyArrays: true } },

        // Add RouteName, SupervisorName, and VehichleNo from route
        {
          $addFields: {
            RouteName: "$route.RouteName",
            SupervisorName: "$supervisor.SupervisorName",
            VehichleNo: "$route.VehichleNo",
          },
        },

        // Remove joined arrays for clean response
        {
          $project: {
            route: 0,
            supervisor: 0,
          },
        },
      ])
      .toArray();

    if (!agents || agents.length === 0) {
      return res.status(404).json({ message: "No agents found" });
    }

    // Return a single object if agentCode is provided, else return array
    const responseData = agentCode ? agents[0] : agents;

    res.json({ success: true, data: responseData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    await client.close();
  }
});

// ✅ 4️⃣ Get single item
router.get("/items/:itemCode", async (req, res) => {
  let client;
  try {
    const { itemCode } = req.params;
    ({ client, db } = await connectToMongo());
    const item = await db.collection("ItemMaster").findOne({
      $or: [{ ItemCode: Number(itemCode) }, { ItemCode: itemCode }],
    });

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    res.json({ success: true, data: item });
  } catch (err) {
    console.error("❌ Error fetching item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ✅ 5️⃣ Get route info
router.get("/routes/:routeCode", async (req, res) => {
  let client;
  try {
    const { routeCode } = req.params;
    ({ client, db } = await connectToMongo());
    const route = await db.collection("SalesRouteMaster").findOne({
      $or: [{ RouteCode: Number(routeCode) }, { RouteCode: routeCode }],
    });

    if (!route)
      return res
        .status(404)
        .json({ success: false, message: "Route not found" });

    res.json({ success: true, data: route });
  } catch (err) {
    console.error("❌ Error fetching route:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ✅ 6️⃣ Get combined Agent + Route + Item data
router.get("/combined", async (req, res) => {
  let client;
  try {
    const { agentCode, routeCode, itemCode } = req.query;
    ({ client, db } = await connectToMongo());

    console.log("📩 /combined called with:", req.query);

    let agent = null;
    if (agentCode) {
      agent = await db.collection("AgentMaster").findOne({
        $or: [{ AgentCode: Number(agentCode) }, { AgentCode: agentCode }],
      });
    }

    const usedRouteCode = routeCode || agent?.SalesRouteCode;
    let route = null;
    if (usedRouteCode) {
      route = await db.collection("SalesRouteMaster").findOne({
        $or: [
          { RouteCode: Number(usedRouteCode) },
          { RouteCode: usedRouteCode },
        ],
      });
    }

    let item = null;
    if (itemCode) {
      item = await db.collection("ItemMaster").findOne({
        $or: [{ ItemCode: Number(itemCode) }, { ItemCode: itemCode }],
      });
    }

    res.json({
      success: true,
      data: {
        AgentCode: agent?.AgentCode || agentCode,
        AgentName: agent?.AgentName || "N/A",
        RouteCode: route?.RouteCode || usedRouteCode || "N/A",
        RouteName: route?.RouteName || "N/A",
        VehichleNo: route?.VehichleNo || "N/A",
        ItemCode: item?.ItemCode || itemCode || null,
        ItemName: item?.ItemNameEnglish || item?.ItemName || "N/A",
      },
    });
  } catch (err) {
    console.error("❌ Error fetching combined data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

// ✅ 7️⃣ Combined by ItemCode
router.get("/combined-by-item/:itemCode", async (req, res) => {
  let client;
  try {
    const { itemCode } = req.params;
    console.log("📩 /combined-by-item called with:", itemCode);

    ({ client, db } = await connectToMongo());
    const item = await db.collection("ItemMaster").findOne({
      $or: [{ ItemCode: Number(itemCode) }, { ItemCode: itemCode }],
    });

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    const route = await db.collection("SalesRouteMaster").findOne({
      RouteCode: item?.RouteCode || null,
    });

    const agent = await db.collection("AgentMaster").findOne({
      SalesRouteCode: route?.RouteCode || null,
    });

    res.json({
      success: true,
      data: {
        ItemCode: item?.ItemCode,
        ItemName: item?.ItemNameEnglish || item?.ItemName || "N/A",
        RouteCode: route?.RouteCode || "N/A",
        RouteName: route?.RouteName || "N/A",
        AgentCode: agent?.AgentCode || "N/A",
        AgentName: agent?.AgentName || "N/A",
        VehichleNo: route?.VehichleNo || "N/A",
      },
    });
  } catch (err) {
    console.error("❌ Error fetching combined-by-item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (client) await client.close();
  }
});

module.exports = router;
