const router = require("express").Router();
const {
  getProductById,
  getProductReviews,
  addProduct,
  addProductReview,
  editProduct,
  editProductImage,
  deleteProduct,
} = require("../controllers/products");
const checkAdmin = require("../middlewares/checkAdmin")
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);
router.post("/add", addProduct);
router.put("/:id/add-review", addProductReview);
router.patch("/:id/edit", editProduct);
router.patch("/:id/edit-image", upload.array("files"), checkAdmin, editProductImage);
router.delete("/:id", deleteProduct);

module.exports = router;
