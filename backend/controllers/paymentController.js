const { where } = require("sequelize");
const Cashfree = require("../config/cashfree");
const Order = require("../models/order");
const User = require("../models/user");
require("dotenv").config();

const createOrder = async (req, res) => {
  console.log("🔹 Create Order API called");

  try {
    const user = req.user;

    // Auth check
    if (!user) {
      console.warn("⚠️ User not authenticated");
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    console.log("✅ Authenticated user:", {
      id: user.id,
      email: user.email,
    });

    const orderId = `order_${user.id}_${Date.now()}`;
    console.log("🆔 Generated orderId:", orderId);

    const orderAmount = parseFloat(process.env.PREMIUM_PRICE || "499");

    const request = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: "INR",
      order_note: "Premium Membership - Expense Tracker",
      customer_details: {
        customer_id: String(user.id),
        customer_name: user.name || "User",
        customer_email: user.email || "test@example.com",
        customer_phone: user.phone || "9999999999",
      },
      order_meta: {
        return_url: `${process.env.APPLICATION_BACKEND_BASE_URL}/api/payments/order-status?order_id=${orderId}`,
      },
    };

    console.log("📦 Cashfree order request payload:", request);

    // Create order with Cashfree
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    console.log("💳 Cashfree response received:", response?.data);

    if (!response.data?.payment_session_id) {
      console.error("❌ No payment session ID in Cashfree response");
      throw new Error("No payment session received");
    }

    // Save order in DB
    const newOrder = await Order.create({
      orderId: response.data.order_id,
      UserId: user.id,
      amount: orderAmount,
      status: "PENDING",
      paymentSessionId: response.data.payment_session_id,
    });

    console.log("📝 Order saved to DB:", {
      id: newOrder.id,
      orderId: newOrder.orderId,
      status: newOrder.status,
    });

    // Success response
    res.json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
    });

    console.log("✅ Create Order API completed successfully");
  } catch (err) {
    console.error("🔥 Create order error:", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const getPaymentStatus = async (req, res) => {
  console.log("🔹 Get Payment Status API called");

  try {
    const orderId = req.query.order_id;

    // Validate input
    if (!orderId) {
      console.warn("⚠️ order_id missing in query params");
      return res.status(400).json({
        success: false,
        message: "order_id is required",
      });
    }

    console.log("🆔 Fetching payment status for orderId:", orderId);

    // Fetch payment details from Cashfree
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

    const cashfreePaymentResponseData = response?.data || [];

    console.log(
      "💳 Cashfree payment transactions received:",
      cashfreePaymentResponseData,
    );

    let orderStatus;

    if (
      cashfreePaymentResponseData.some(
        (transaction) => transaction.payment_status === "SUCCESS",
      )
    ) {
      orderStatus = "SUCCESS";
    } else if (
      cashfreePaymentResponseData.some(
        (transaction) => transaction.payment_status === "PENDING",
      )
    ) {
      orderStatus = "PENDING";
    } else {
      orderStatus = "FAILED";
    }

    console.log("📌 Derived order status:", {
      orderId,
      orderStatus,
    });

    //1. get order by order id
    //2. update order status by order id

    const getOrderFromDB = await Order.findOne({
      where: { orderId },
    });

    // console.log(getOrderFromDB, "getOrderFromdb");

    const updateOrderStatus = await Order.update(
      { status: orderStatus },
      {
        where: {
          orderId: orderId,
        },
      },
    );
    // console.log("updateOrderStatus", updateOrderStatus);

    console.log("getOrderFromDB.UserId", getOrderFromDB.UserId);
    const updateUserIsPremiumStatus = await User.update(
      { isPremium: true },
      {
        where: {
          id: getOrderFromDB.UserId,
        },
      },
    );
    console.log("updateUserIsPremiumStatus", updateUserIsPremiumStatus);

    res.json({
      success: true,
      orderStatus,
      orderId,
      userId: getOrderFromDB.UserId,
    });

    console.log("✅ Get Payment Status API completed successfully");
  } catch (error) {
    console.error("🔥 Error while fetching payment status:", {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch payment status",
    });
  }
};

module.exports = { createOrder, getPaymentStatus };

// PGOrderFetchPayments
// http://localhost:5000/order-status?order_id=${orderId}
//  "http://localhost:5000/api/payments/order-status?order_id=${orderId}",
