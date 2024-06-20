const router = require("express").Router();
const {
  getAllOrders,
  getUserOrders
} = require("../controllers/orders");
const auth = require("../middlewares/auth");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/", auth, checkAdmin, getAllOrders)
router.get("/me", auth, getUserOrders);

module.exports = router;