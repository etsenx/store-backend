const router = require("express").Router();
const { addCategory } = require("../controllers/categories");

router.post("/add", addCategory);

module.exports = router;