const router = require("express").Router();
const {
  getProducts,
  deleteProductImages,
  editPrimaryImage,
} = require("../controllers/products");
const auth = require("../middlewares/auth");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/", getProducts);
router.patch("/images/primary", auth, checkAdmin, editPrimaryImage);
router.delete("/images", auth, checkAdmin, deleteProductImages);

module.exports = router;
