// // models/Order.js
// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema(
//   {
//     agentCode: { type: String, required: true },
//     route: { type: String, required: true },
//     itemCode: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     totalPrice: { type: Number, default: 0 }, // 💰 per-item total
//     TotalOrder: { type: Number, default: 0 }, // 💰 overall grand total
//     status: { type: String, default: "Pending" },
//     approvedAt: { type: Date, default: null },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Order", OrderSchema);

// backend/models/Order.js
// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    agentCode: { type: Number, required: true },
    route: { type: Number, required: true },

    // 👇 New structure: multiple items in one array
    itemInfo: [
      {
        itemCode: { type: String, required: true },
        quantity: { type: Number, required: true },
        itemName: { type: String, required: true },
        price: { type: Number, required: true },
        acceptedQuantity: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["Pending", "Accepted", "Rejected", "Modified"],
          default: "Accepted",
        },
        totalPrice: { type: Number, required: true },
      },
    ],
    TotalOrder: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
  
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
