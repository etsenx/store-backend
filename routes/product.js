const router = require("express").Router();
const {
  addProduct,
  editProduct,
  editProductImage,
  addProductReview,
  getProductReviews,
} = require("../controllers/products");

router.post("/add", addProduct);
router.patch("/:id/edit", editProduct);
router.patch("/:id/edit-image", editProductImage);
router.get("/:id/reviews", getProductReviews);
router.put("/:id/add-review", addProductReview);

module.exports = router;
