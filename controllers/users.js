const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports.register = (req, res, next) => {
  const { email, password, name, avatar } = req.body;
  User.createUser(email, password, name, avatar)
    .then((user) => {
      res.status(201).send({
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        __id: user.id,
      });
    })
    .catch((err) => {
      if (err) {
        if (err.code === 11000) {
          next({
            statusCode: 409,
            message: "User already exists",
          });
        } else if (err.name === "ValidationError") {
          next({
            statusCode: 400,
            message: "User validation failed",
          });
        }
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      res.status(200).send({
        token: jwt.sign(
          { _id: user._id },
          process.env.NODE_ENV === "production"
            ? process.env.JWT_SECRET
            : "devsecret",
          { expiresIn: "3d" }
        ),
      });
    })
    .catch((err) => {
      if (err) {
        if (err.message === "Incorrect Password") {
          next({
            statusCode: 401,
            message: "Incorrect Password",
          });
        } else if (err.message === "Email Not Found") {
          next({
            statusCode: 401,
            message: "Email Not Found",
          });
        }
      }
      next(err);
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch(next);
};

module.exports.changePrivilege = (req, res, next) => {
  const userId = req.body.userid;
  const updatePrivilege = req.body.privilege;

  if (!["user", "admin"].includes(updatePrivilege)) {
    return res.status(400).send({ message: "Invalid value" });
  }

  User.findOneAndUpdate(
    { _id: userId },
    { privilege: updatePrivilege },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        throw new Error("User not found", { statusCode: 404 });
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === "User not found") {
        next({
          statusCode: 404,
          message: err.message,
        });
      }
      next(err);
    });
};

module.exports.changeAvatar = (req, res, next) => {
  const { _id } = req.user;
  const newAvatar = req.body.avatar;
  User.findOneAndUpdate({ _id }, { avatar: newAvatar }, { new: true })
    .then((user) => {
      if (!user) {
        throw new Error("User not found", { statusCode: 404 });
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === "User not found") {
        next({
          statusCode: 404,
          message: err.message,
        });
      }
      next(err);
    });
};

module.exports.changePassword = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .select("+password")
    .orFail()
    .then((user) => {
      console.log(user);
    });
};
