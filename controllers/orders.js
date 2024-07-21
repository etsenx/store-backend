const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

module.exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();

    const resOrders = orders.map((order) => ({
      id: order._id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    }));
    res.status(200).send(resOrders);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userOrders = await Order.find({ orderedBy: userId }).sort({
      createdAt: -1,
    });

    const orders = userOrders.map((order) => ({
      id: order._id,
      amount: order.amount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    }));

    res.status(200).send(orders);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports.getOrderDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id });

    res.status(200).send(order);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports.createOrder = async (req, res, next) => {
  try {
    const orderDetails = req.body;
    const userId = req.user._id;

    const userCart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price images stock",
    });

    if (!userCart || userCart.items.length === 0) {
      throw { statusCode: 400, message: "Cart is empty" };
    }

    for (const item of userCart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        throw {
          statusCode: 409,
          message: `Insufficient stock for product ${product.name}`,
        };
      }
    }

    const orderedItems = userCart.items.map((item) => {
      const sortedImages = item.productId.images.length
        ? item.productId.images.sort((a, b) => b.isPrimary - a.isPrimary)
        : [];

      const primaryImageUrl = sortedImages.length
        ? sortedImages[0].link
        : "tripleshop/product-example";

      return {
        productId: item.productId._id,
        productName: item.productId.name,
        pricePerItem: item.productId.price,
        quantity: item.quantity,
        image: primaryImageUrl,
      };
    });

    const createdOrder = await Order.create({
      orderedBy: userId,
      amount: orderDetails.amount,
      orderedItems,
      shippingDetails: orderDetails.shippingDetails,
      paymentMethod: orderDetails.paymentMethod,
    });

    await Promise.all(
      userCart.items.map(async (item) => {
        const product = await Product.findById(item.productId._id);
        product.stock -= item.quantity;
        await product.save();
      })
    );

    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res
      .status(201)
      .json({ message: "Order created successfully", order: createdOrder });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { orderId, deliveryStatus } = req.body;
    const result = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: deliveryStatus }
    );

    if (!result) {
      throw { statusCode: 404, message: "Order not found" };
    }

    res.status(204).send("Delivery Status Updated");
  } catch (err) {
    next(err);
  }
};

module.exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { orderId, paymentStatus } = req.body;
    const result = await Order.findOneAndUpdate(
      { _id: orderId },
      { paymentStatus: paymentStatus }
    );

    if (!result) {
      throw { statusCode: 404, message: "Order not found" };
    }

    res.status(204).send("Payment Status Updated");
  } catch (err) {
    next(err);
  }
};

module.exports.deleteOrder = async (req, res, next) => {
  const orderId = req.params.id;
  Order.deleteOne({ _id: orderId })
    .orFail()
    .then(() => {
      res.status(204).send("Order deleted successfully");
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next({
          statusCode: 404,
          message: "Order not found",
        });
      }
    });
};

module.exports.orderChartData = async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthlyOrders = Array(12).fill(0);

    orders.forEach((order) => {
      monthlyOrders[order._id - 1] = order.totalOrders;
    });

    res.status(200).json({ orders: monthlyOrders });
  } catch (error) {
    next(error);
  }
};

module.exports.salesChartData = async (req, res, next) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthlySales = Array(12).fill(0);

    sales.forEach((sale) => {
      monthlySales[sale._id - 1] = sale.totalSales;
    });

    res.json({ sales: monthlySales });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.orderOverview = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const newOrders = await Order.countDocuments({
      createdAt: { $gte: lastWeek },
    });

    res.status(200).json({ total: totalOrders, additionalInfo: newOrders });
  } catch (error) {
    console.error("Error fetching orders summary", error);
    next(error);
  }
};

module.exports.salesOverview = async (req, res, next) => {
  try {
    const totalSalesResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
        },
      },
    ]);

    const totalSales =
      totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthEnd = new Date();
    thisMonthEnd.setMonth(thisMonthEnd.getMonth() + 1);
    thisMonthEnd.setDate(0);
    thisMonthEnd.setHours(23, 59, 59, 999);

    const thisMonthSalesResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
        },
      },
    ]);

    const thisMonthSales =
      thisMonthSalesResult.length > 0 ? thisMonthSalesResult[0].totalSales : 0;

    const lastMonthStart = new Date();
    lastMonthStart.setDate(1);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const lastMonthSalesResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
        },
      },
    ]);

    const lastMonthSales =
      lastMonthSalesResult.length > 0 ? lastMonthSalesResult[0].totalSales : 0;

    let percentageChange = 0;
    if (lastMonthSales > 0) {
      percentageChange =
        ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;
    } else if (thisMonthSales > 0) {
      percentageChange = 100;
    }

    res.json({
      total: `$${totalSales}`,
      additionalInfo: `${Math.round(percentageChange)}%`,
    });
  } catch (error) {
    console.error("Error fetching sales overview", error);
    next(error);
  }
};
