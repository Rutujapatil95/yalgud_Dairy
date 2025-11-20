

// const express = require("express");
// const router = express.Router();
// const orderController = require("../controllers/orderController");
// const Order = require("../models/order"); // ensure this matches your filename (Order.js or orderModel.js)

// // 🟢 Create New Order
// router.post("/", orderController.createOrder);

// // 🟢 Keep this first
// router.get("/agent-codes", async (req, res) => {
//   try {
//     const codes = await Order.distinct("agentCode");
//     res.status(200).json({ success: true, data: codes });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // 🟢 Get All Orders
// router.get("/", orderController.getOrders);

// // Get order by ID
// router.get("/:id", orderController.getOrderById);

// // 🟢 Get Orders by Agent Code
// router.post("/by-agent", async (req, res) => {
//   try {
//     const { agentCode } = req.body;
//     if (!agentCode)
//       return res.status(400).json({ message: "agentCode is required" });

//     const orders = await Order.find({ agentCode });
//     if (!orders.length)
//       return res
//         .status(404)
//         .json({ message: "No orders found for this agent" });

//     res.json({ success: true, data: orders });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // // 🟢 Get All Unique Agent Codes
// // router.get("/agent-codes", async (req, res) => {
// //   try {
// //     const codes = await Order.distinct("agentCode");
// //     res.json(codes);
// //   } catch (err) {
// //     res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // });

// // 🟢 Get All Orders Grouped by Agent
// router.get("/all", async (req, res) => {
//   try {
//     const orders = await Order.find();
//     if (!orders.length)
//       return res.status(404).json({ message: "No orders found" });

//     // Group orders by agentCode
//     const grouped = orders.reduce((acc, order) => {
//       if (!acc[order.agentCode]) acc[order.agentCode] = [];
//       acc[order.agentCode].push(order);
//       return acc;
//     }, {});
//     res.json({ success: true, data: grouped });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // 🟢 Approve Multiple Orders
// router.post("/approve", orderController.approveOrders);

// // 🟢 Update Order Status (Accept/Reject)
// router.put("/update-status/:id", async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!status) return res.status(400).json({ message: "Status is required" });

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { Status: status }, // ensure capital 'S' to match your frontend key
//       { new: true }
//     );

//     if (!order) return res.status(404).json({ message: "Order not found" });

//     res.json({ message: "Order status updated successfully", order });
//   } catch (error) {
//     console.error("Error updating status:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // 🟢 Edit (Update) Entire Order
// // router.put("/:id", async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const updateData = req.body;

// //     const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
// //       new: true,
// //     });

// //     if (!updatedOrder) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     res.json({
// //       message: "Order updated successfully",
// //       order: updatedOrder,
// //     });
// //   } catch (error) {
// //     console.error("Error updating order:", error);
// //     res.status(500).json({ message: "Server error while updating order" });
// //   }
// // });
// router.put("/:orderId", orderController.updateOrder);
// // 🔴 Delete Order
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Order.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.json({ message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting order:", error);
//     res.status(500).json({ message: "Server error while deleting order" });
//   }
// });

// module.exports = router;



// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const Order = require("../models/order");

// 🟢 Disable caching at route-level if needed
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// 🟢 Create a new order
router.post("/", orderController.createOrder);

// 🟢 Get unique agent codes
router.get("/agent-codes", async (req, res) => {
  try {
    const codes = await Order.distinct("agentCode");
    res.status(200).json({ success: true, data: codes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🟢 Get all orders (supports ?agentCode=xxxx)
router.get("/", orderController.getOrders);

// 🟢 Get order by ID
router.get("/:id", orderController.getOrderById);

// 🟢 Get orders by agent (POST version — optional)
router.post("/by-agent", async (req, res) => {
  try {
    const { agentCode } = req.body;
    if (!agentCode) return res.status(400).json({ message: "agentCode is required" });

    const orders = await Order.find({ agentCode });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Get all orders grouped by agent
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find();
    const grouped = orders.reduce((acc, order) => {
      if (!acc[order.agentCode]) acc[order.agentCode] = [];
      acc[order.agentCode].push(order);
      return acc;
    }, {});
    res.status(200).json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Approve multiple orders
router.post("/approve", orderController.approveOrders);

// 🟢 Update order status
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ success: true, message: "Status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🟢 Update order (PUT full)
router.put("/:orderId", orderController.updateOrder);

// 🟢 Delete order
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
