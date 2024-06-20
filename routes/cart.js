const router = require("express").Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart
} = require("../controllers/users");
const auth = require("../middlewares/auth");

router.get("/get", auth, getCart)
router.post("/add", auth, addToCart);
router.put("/update", auth, updateCartItemQuantity);
router.delete("/remove/:productId", auth, removeFromCart);

module.exports = router;
