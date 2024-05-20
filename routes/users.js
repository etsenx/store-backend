const router = require("express").Router();
const {
  getCurrentUser,
  getAllUsers,
  getUserById,
  changePassword,
  changeProfile,
  changeProfileById,
  deleteUser,
} = require("../controllers/users");
const multer = require("multer");
const checkAdmin = require("../middlewares/checkAdmin");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/me", getCurrentUser);
router.get("/all", getAllUsers);
router.get("/:id", getUserById);
router.patch("/change-password", changePassword);
router.patch("/change-profile", upload.single("file"), changeProfile);
router.patch("/change-profile/:id", checkAdmin, changeProfileById);
router.delete("/delete/:id", deleteUser);

module.exports = router;
