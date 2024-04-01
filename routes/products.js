const router = require("express").Router();
const { getAllProducts } = require("../controllers/products");

router.get("/", getAllProducts);

module.exports = router;
