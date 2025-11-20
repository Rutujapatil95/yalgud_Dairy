// const Order = require("../models/order");

// exports.createOrder = async (req, res) => {
//   try {
//     const { agentCode, route, items, TotalOrder } = req.body;
//     console.log("📦 Creating order for agent:", agentCode, route, items);

//     const newOrder = new Order({
//       agentCode,
//       route,
//       itemInfo: items,
//       TotalOrder,
//     });

//     await newOrder.save();
//     res.status(201).json({ success: true, data: newOrder });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.getOrders = async (req, res) => {
//   try {
//     const { agentCode, route } = req.query;
//     const filter = {};

//     if (agentCode) filter.agentCode = agentCode;
//     if (route) filter.route = route;

//     const orders = await Order.find(filter).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       message: "Orders fetched successfully",
//       total: orders.length,
//       data: orders,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching orders:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.getOrdersByAgent = async (req, res) => {
//   try {
//     const { agentCode, agentCodes } = req.body;

//     // Determine if single or multiple agent fetch
//     let filter = {};
//     if (Array.isArray(agentCodes) && agentCodes.length > 0) {
//       filter = { agentCode: { $in: agentCodes } };
//     } else if (agentCode) {
//       filter = { agentCode };
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "agentCode or agentCodes is required in the request body",
//       });
//     }

//     console.log("📦 Fetching orders for filter:", filter);

//     const orders = await Order.find(filter).sort({ createdAt: -1 });

//     if (!orders.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No orders found for the given agent(s)",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       total: orders.length,
//       data: orders,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching orders by agent:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.approveOrders = async (req, res) => {
//   try {
//     const { orderIds } = req.body;

//     if (!Array.isArray(orderIds) || orderIds.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No orders selected for approval" });
//     }

//     const result = await Order.updateMany(
//       { _id: { $in: orderIds } },
//       { status: "Approved", approvedAt: new Date() }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Orders approved successfully",
//       modifiedCount: result.modifiedCount,
//     });
//   } catch (error) {
//     console.error("❌ Error approving orders:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.deleteOrder = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deleted = await Order.findByIdAndDelete(id);
//     if (!deleted) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error deleting order:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.getOrderById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id);
//     if (!order) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching order by ID:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.updateOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { items, status } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order)
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });

//     // Update each item in itemInfo
//     order.itemInfo = order.itemInfo.map((item) => {
//       const updatedItem = items.find((i) => i.itemCode === item.itemCode);
//       if (updatedItem) {
//         return {
//           ...item.toObject(),
//           acceptedQuantity: updatedItem.acceptedQuantity,
//           status: updatedItem.status,
//           price: updatedItem.price,
//           totalPrice: updatedItem.acceptedQuantity * updatedItem.price,
//         };
//       }
//       return item;
//     });

//     // Optionally update overall order status
//     if (status) order.status = status;

//     // Recalculate TotalOrder
//     order.TotalOrder = order.itemInfo.reduce(
//       (sum, i) => sum + i.acceptedQuantity * i.price,
//       0
//     );

//     await order.save();

//     res.json({
//       success: true,
//       message: "Order updated successfully!",
//       data: order,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// controllers/orderController.js
const Order = require("../models/order");

/**
 * 🟢 CREATE NEW ORDER
 */
exports.createOrder = async (req, res) => {
  try {
    const { agentCode, route, items, TotalOrder } = req.body;

    if (!agentCode || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "agentCode and items are required",
      });
    }

    console.log("📦 Creating order for agent:", agentCode);

    const newOrder = new Order({
      agentCode,
      route,
      itemInfo: items,
      TotalOrder,
    });

    await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🟢 GET ALL ORDERS (supports ?agentCode=xxxx)
 */
exports.getOrders = async (req, res) => {
  try {
    const { agentCode, route } = req.query;
    const filter = {};

    if (agentCode) filter.agentCode = agentCode;
    if (route) filter.route = route;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🟢 GET ORDERS BY AGENT CODE(S)
 */
exports.getOrdersByAgent = async (req, res) => {
  try {
    const { agentCode, agentCodes } = req.body;

    let filter = {};
    if (Array.isArray(agentCodes) && agentCodes.length > 0) {
      filter = { agentCode: { $in: agentCodes } };
    } else if (agentCode) {
      filter = { agentCode };
    } else {
      return res.status(400).json({
        success: false,
        message: "agentCode or agentCodes is required in request body",
      });
    }

    console.log("📦 Fetching orders for filter:", filter);

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the given agent(s)",
      });
    }

    res.status(200).json({
      success: true,
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error fetching orders by agent:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🟢 GET SINGLE ORDER BY ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Error fetching order by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🟢 UPDATE ORDER ITEMS OR STATUS
 */
exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // Update itemInfo if provided
    if (Array.isArray(items)) {
      order.itemInfo = order.itemInfo.map((item) => {
        const updatedItem = items.find((i) => i.itemCode === item.itemCode);
        if (updatedItem) {
          return {
            ...item.toObject(),
            acceptedQuantity: updatedItem.acceptedQuantity,
            price: updatedItem.price,
            status: updatedItem.status,
            totalPrice: updatedItem.acceptedQuantity * updatedItem.price,
          };
        }
        return item;
      });

      // Recalculate total
      order.TotalOrder = order.itemInfo.reduce(
        (sum, i) => sum + i.acceptedQuantity * i.price,
        0
      );
    }

    // Update order status if provided
    if (status) order.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * 🟢 APPROVE MULTIPLE ORDERS
 */
exports.approveOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No orders selected for approval" });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { status: "Approved", approvedAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "Orders approved successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error approving orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🟢 DELETE ORDER
 */
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
