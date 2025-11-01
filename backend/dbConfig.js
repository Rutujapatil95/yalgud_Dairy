const sql = require("mssql");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT, 10),
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

const mongoConfig = {
  url: process.env.MONGO_URL || "mongodb://localhost:27017",
  database: process.env.MONGO_DATABASE || "ERPData10Mongo",
};

module.exports = { sql, sqlConfig, MongoClient, mongoConfig };
