const router = require("express").Router();
const { addProduct } = require("../controllers/products");

router.post("/add", addProduct);

module.exports = router;
