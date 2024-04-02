const router = require("express").Router();
const { getAllCategories } = require("../controllers/categories");

router.get("/", getAllCategories);

module.exports = router;