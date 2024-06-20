const router = require("express").Router();
const {
  orderChartData,
  salesChartData,
  orderOverview,
  salesOverview
} = require("../controllers/orders");
const { usersRegisteredOverview } = require("../controllers/users");

router.get("/orders", orderChartData);
router.get("/sales", salesChartData);
router.get("/overview/orders", orderOverview);
router.get("/overview/sales", salesOverview);
router.get('/overview/users', usersRegisteredOverview);

module.exports = router;