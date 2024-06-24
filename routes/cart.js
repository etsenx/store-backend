const router = require("express").Router();
const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart
} = require("../controllers/users");
const auth = require("../middlewares/auth");

router.post("/add", auth, addToCart);
router.put("/update", auth, updateCartItemQuantity);
router.delete("/remove", auth, removeFromCart);

module.exports = router;
