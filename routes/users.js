const router = require("express").Router();
const {
  getCurrentUser,
  getAllUsers,
  getUserById,
  getUsersName,
  changePassword,
  changeProfile,
  changeProfileById,
  deleteUser,
} = require("../controllers/users");
const cartRoutes = require("./cart");

const multer = require("multer");
const checkAdmin = require("../middlewares/checkAdmin");
const auth = require("../middlewares/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/me", auth, getCurrentUser);
router.get("/all", auth, checkAdmin, getAllUsers);
router.get("/:id", auth, getUserById);
router.post("/username", getUsersName);
router.patch("/change-password", auth, changePassword);
router.patch("/change-profile", auth, upload.single("file"), changeProfile);
router.patch("/change-profile/:id", auth, checkAdmin, changeProfileById);
router.delete("/delete/:id", auth, checkAdmin, deleteUser);
router.use("/cart", cartRoutes);

module.exports = router;
