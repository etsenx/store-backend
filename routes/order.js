const router = require("express").Router();
const {
  getOrderDetail,
  createOrder,
  deleteOrder,
  updateDeliveryStatus,
  updatePaymentStatus,
  orderChartData,
  salesChartData,
  orderOverview,
} = require("../controllers/orders");
const auth = require("../middlewares/auth");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/overview", auth, checkAdmin, orderChartData);
router.get("/overview/sales", auth, checkAdmin, salesChartData);
router.get("/overview/order", auth, checkAdmin, orderOverview);
router.get("/:id", auth, getOrderDetail);
router.post("/", auth, createOrder);
router.patch("/delivery-status", auth, checkAdmin, updateDeliveryStatus);
router.patch("/payment-status", auth, checkAdmin, updatePaymentStatus);
router.delete("/:id", auth, checkAdmin, deleteOrder);

module.exports = router;