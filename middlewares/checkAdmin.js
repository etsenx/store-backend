const User = require('../models/user'); // Assuming you have a User model defined somewhere

module.exports = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const requestingUser = await User.findById(_id);
    if (!requestingUser || requestingUser.privilege !== 'admin') {
      throw { statusCode: 401, message: 'Not Authorized' };
    }

    next();
  } catch (err) {
    next(err);
  }
};
