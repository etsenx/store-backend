const router = require('express').Router();
const { getCurrentUser, changePrivilege, changeAvatar, changePassword } = require('../controllers/users');

router.get('/me', getCurrentUser);
router.post('/change-privilege', changePrivilege);
router.post('/change-avatar', changeAvatar);
router.post('/change-password', changePassword)

module.exports = router;