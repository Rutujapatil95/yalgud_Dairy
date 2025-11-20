const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.MONGO_DATABASE || "ERPData10";

mongoose
  .connect(`${mongoUrl}/${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`✅ MongoDB connected to database: ${dbName}`))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const categoryRoutes = require("./routes/categoryRoutes");
const offersRoutes = require("./routes/offers");
const itemRoutes = require("./routes/itemRoutes");
const { router: agentRoutes1, migrateAllTables } = require("./routes/agent1");
const genericRoutes = require("./routes/genericRoutes");
const orderRoutes = require("./routes/orderRoutes");
const masterRoutes = require("./routes/masterRoutes");
const filterRoutes = require("./routes/filterRoutes");
const templateRoutes = require("./routes/templateRoutes");
const newCategoryRoutes = require("./routes/newcategoryRoutes");
const agentRoutes2 = require("./routes/agentRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/newcategories", newCategoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/advertisements", offersRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/agent1", agentRoutes1);
app.use("/api/orders", orderRoutes);
app.use("/api/masters", masterRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/agent", agentRoutes2);
app.use("/api/users", userRoutes);

app.use("/api", genericRoutes);
app.use("/api", filterRoutes);

migrateAllTables().catch((err) => console.error("❌ Migration failed:", err));

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Backend Running Successfully!",
    status: "ok",
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
