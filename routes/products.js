const router = require("express").Router();
const {
  getAllProducts,
  deleteProductImages,
  editPrimaryImage,
} = require("../controllers/products");
const auth = require("../middlewares/auth");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/", getAllProducts);
router.patch("/images/primary", auth, checkAdmin, editPrimaryImage);
router.delete("/images", auth, checkAdmin, deleteProductImages);

module.exports = router;
