const router = require("express").Router();
const {
  getProductById,
  getProductReviews,
  getAverageRating,
  addProduct,
  addProductReview,
  editProduct,
  editProductImage,
  deleteProduct,
  deleteProductReview
} = require("../controllers/products");
const checkAdmin = require("../middlewares/checkAdmin");
const auth = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);
router.get("/:productId/average-rating", getAverageRating);
router.post("/add", auth, checkAdmin, addProduct);
router.put("/:id/add-review", auth, addProductReview);
router.patch("/:id/edit", auth, checkAdmin, editProduct);
router.patch("/:id/edit-image", upload.array("files"), auth, checkAdmin, editProductImage);
router.delete("/:id", auth, deleteProduct);
router.delete('/:productId/review/:reviewId', auth, checkAdmin, deleteProductReview);

module.exports = router;
