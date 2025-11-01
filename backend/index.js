// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ============ Middlewares ============
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============ MongoDB Connection ============
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.MONGO_DATABASE || "ERPData10";

mongoose
  .connect(`${mongoUrl}/${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`✅ MongoDB connected to database: ${dbName}`))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============ Routes ============

// Category routes
app.use("/api/categories", require("./routes/categoryRoutes"));

// Advertisement routes
app.use("/api/advertisements", require("./routes/offers"));

// Items routes
app.use("/api/items", require("./routes/itemRoutes"));

// Agent routes
const { router: agentRoutes, migrateAllTables } = require("./routes/agent");
app.use("/api/agent", agentRoutes);


app.use("/api", require("./routes/genericRoutes"));

// ============ Migrate Tables (Optional) ============
migrateAllTables().catch((err) =>
  console.error("❌ Migration failed:", err)
);

// ============ Default Route ============
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Backend Running Successfully!",
    status: "ok",
  });
});

// ============ Global Error Handler ============
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
