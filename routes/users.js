const router = require("express").Router();
const {
  getCurrentUser,
  changePrivilege,
  changePassword,
  changeProfile,
  deleteUser,
} = require("../controllers/users");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

router.get("/me", getCurrentUser);
router.post("/change-privilege", changePrivilege);
router.post("/change-password", changePassword);
router.patch("/change-profile", upload.single("file"), changeProfile);
router.delete("/delete/:id", deleteUser);

module.exports = router;
