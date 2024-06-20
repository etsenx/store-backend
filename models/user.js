const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Cart = require("./cart");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: "Incorrect Email Format",
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  avatar: {
    type: String,
    default: "tripleshop/example",
  },
  privilege: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  registerDate: {
    type: Date,
    default: Date.now(),
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(
          Object.assign(new Error("Email not found"), {
            statusCode: 401,
          })
        );
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            Object.assign(new Error("Incorrect password"), {
              statusCode: 401,
            })
          );
        }

        return user;
      });
    });
};

userSchema.statics.createUser = function createUser(
  email,
  password,
  name,
  avatar
) {
  if (!password) {
    throw Object.assign(new Error("Failed"), { statusCode: 400 });
  }
  return bcrypt
    .hash(password, 10)
    .then((hashedPass) =>
      this.create({ email, password: hashedPass, name, avatar })
    )
    .then((user) => user);
};

userSchema.methods.addToCart = async function addToCart(product) {
  let cart = await Cart.findOne({ userId: this._id });

  if (!cart) {
    cart = new Cart({ userId: this._id, items: [] });
  }
  const productIndex = cart.items.findIndex(
    (item) => item.productId.toString() === product.productId.toString()
  );

  if (productIndex > -1) {
    cart.items[productIndex].quantity += product.quantity;
  } else {
    cart.items.push({
      productId: product.productId,
      quantity: product.quantity,
    });
  }

  await cart.save();

  this.cartId = cart._id;
  return this.save();
};

userSchema.methods.removeFromCart = async function removeFromCart(productId) {
  const cart = await Cart.findOneAndUpdate(
    { userId: this._id },
    { $pull: { items: { productId: productId } } },
    { new: true }
  );

  this.cartId = cart._id;
  return this.save();
};

userSchema.methods.updateCartItemQuantity =
  async function updateCartItemQuantity(productId, quantity) {
    const cart = await Cart.findOneAndUpdate(
      { userId: this._id, "items.productId": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    this.cartId = cart._id;
    return this.save();
  };

module.exports = mongoose.model("User", userSchema);
