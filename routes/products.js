const router = require("express").Router();
const {
  getProducts,
  getProductsById,
  deleteProductImages,
  editPrimaryImage,
} = require("../controllers/products");
const auth = require("../middlewares/auth");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/", getProducts);
router.post("/id", getProductsById);
router.patch("/images/primary", auth, checkAdmin, editPrimaryImage);
router.delete("/images", auth, checkAdmin, deleteProductImages);

module.exports = router;
