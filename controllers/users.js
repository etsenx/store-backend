const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Cart = require("../models/cart");
const bcrypt = require("bcrypt");
const cloudinary = require("../utils/cloudinary");
const crypto = require("crypto");

module.exports.register = (req, res, next) => {
  const { email, password, name } = req.body;
  const imageFile = req.file.buffer;
  const publicId = crypto.randomBytes(16).toString("hex");
  const avatar = `tripleshop/users/avatar/${publicId}`;
  User.createUser(email, password, name, avatar)
    .then(async (user) => {
      await new Promise((resolve) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              folder: "tripleshop/users/avatar",
              public_id: publicId,
            },
            (error, uploadResult) => {
              if (error) {
                console.log(error);
              }
              return resolve(uploadResult);
            }
          )
          .end(imageFile);
      });
      return user;
    })
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
    .then((user) =>
      res.status(200).send({
        avatar: user.avatar,
        email: user.email,
        name: user.name,
        privilege: user.privilege,
        registerDate: user.registerDate,
      })
    )
    .catch(next);
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("id email name privilege");
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserById = (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .orFail()
    .then((user) => {
      res.status(200).send({
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        privilege: user.privilege,
        registerDate: user.registerDate,
      });
    });
};

module.exports.getUsersName = async (req, res, next) => {
  const { userIds } = req.body;
  try {
    const users = await User.find({ _id: { $in: userIds } }).select("id name");
    res.status(200).send(users);
  } catch (err) {
    next(err);
  }
};

module.exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      throw { statusCode: 404, message: "Cart not found" };
    }
    res.status(200).json(cart);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports.addToCart = async (req, res, next) => {
  try {
    const { productId, reqCount } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    const product = { productId, quantity: reqCount };
    await user.addToCart(product);

    const addedProduct = await Cart.findById(user.cartId);
    const insertedProduct = addedProduct.items.find((item) => item.productId.toString() === productId);

    res
      .status(200)
      .json({
        message: "Item added to cart successfully",
        product: insertedProduct,
      });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports.updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    await user.updateCartItemQuantity(productId, quantity);

    res.status(200).json({
      message: "Cart item quantity updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports.changeProfile = async (req, res, next) => {
  const { _id } = req.user;
  const { previousAvatar, email, name } = req.body;
  let avatar = previousAvatar;
  let imageFile = null;
  let publicId = "";
  if (req.file) {
    imageFile = req.file.buffer;
    publicId = crypto.randomBytes(16).toString("hex");
    avatar = `tripleshop/users/avatar/${publicId}`;
  }

  User.findOneAndUpdate({ _id }, { avatar, email, name }, { new: true })
    .then(async (user) => {
      if (!user) {
        throw new Error("User not found");
      }
      if (imageFile) {
        await new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream(
              {
                folder: "tripleshop/users/avatar",
                public_id: publicId,
              },
              (error, uploadResult) => {
                if (error) {
                  console.log(error);
                } else {
                  cloudinary.v2.api.delete_resources(previousAvatar, {
                    type: "upload",
                    resource_type: "image",
                  });
                }
                return resolve(uploadResult);
              }
            )
            .end(imageFile);
        });
      }
      return user;
    })
    .then((user) => {
      res.status(200).send({
        avatar: user.avatar,
        email: user.email,
        name: user.name,
        privilege: user.privilege,
        registerDate: user.registerDate,
      });
    })
    .catch((err) => {
      if (err.message === "User not found") {
        next({
          statusCode: 404,
          message: err.message,
        });
      } else if (err.code === 11000) {
        next({
          statusCode: 409,
          message: "User already exists",
        });
      }
      next(err);
    });
};

module.exports.changeProfileById = async (req, res, next) => {
  try {
    const { id: reqId } = req.params;
    const { name, email, privilege: updatePrivilege } = req.body;

    if (!["user", "admin"].includes(updatePrivilege)) {
      throw { statusCode: 400, message: "Invalid value" };
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: reqId },
      { name, email, privilege: updatePrivilege },
      { new: true }
    );

    if (!updatedUser) {
      throw { statusCode: 404, message: "User not found" };
    }

    res.status(200).send({
      avatar: updatedUser.avatar,
      email: updatedUser.email,
      name: updatedUser.name,
      privilege: updatedUser.privilege,
      registerDate: updatedUser.registerDate,
    });
  } catch (err) {
    if (err.code === 11000) {
      next({
        statusCode: 409,
        message: "Email already exists",
      });
    } else {
      next(err);
    }
  }
};

module.exports.changePassword = (req, res, next) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;
  User.findById(_id)
    .select("+password")
    .orFail()
    .then((user) => {
      return bcrypt.compare(oldPassword, user.password).then((matched) => {
        if (!matched) {
          throw new Error("Incorrect Password");
        }
        return bcrypt.hash(newPassword, 10).then((hashedPass) => {
          return User.findOneAndUpdate({ _id }, { password: hashedPass });
        });
      });
    })
    .then(() => {
      res.status(204).send("Password Changed");
    })
    .catch((err) => {
      if (err.message === "Incorrect Password") {
        next({
          statusCode: 401,
          message: "Incorrect Password",
        });
      }
    });
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.deleteOne({ _id: userId }).orFail();
    res.status(204).send("User deleted successfully");
  } catch (err) {
    if (err.name === "DocumentNotFoundError") {
      next({
        statusCode: 404,
        message: "User not found",
      });
    } else {
      next(err);
    }
  }
};

module.exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    await user.removeFromCart(productId);

    res.status(200).json({
      message: "Item removed from cart successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports.usersRegisteredOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const newUsers = await User.countDocuments({
      registerDate: { $gte: lastWeek },
    });

    res.status(200).json({
      total: totalUsers,
      additionalInfo: newUsers,
    });
  } catch (error) {
    console.error("Error fetching users summary", error);
    next(error);
  }
};
