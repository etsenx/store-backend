const router = require("express").Router();
const {
  getCurrentUser,
  changePrivilege,
  changePassword,
  changeProfile,
  deleteUser,
} = require("../controllers/users");

router.get("/me", getCurrentUser);
router.post("/change-privilege", changePrivilege);
router.post("/change-password", changePassword);
router.patch("/change-profile", changeProfile);
router.delete("/delete/:id", deleteUser);

module.exports = router;
