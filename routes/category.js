const router = require("express").Router();
const { addCategory, getCategoryById, updateCategoryName, deleteCategory } = require("../controllers/categories");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/:id", checkAdmin, getCategoryById);
router.post("/add", checkAdmin, addCategory);
router.patch("/:id", checkAdmin, updateCategoryName);
router.delete("/:id", checkAdmin, deleteCategory);

module.exports = router;