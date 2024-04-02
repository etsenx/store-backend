const Product = require("../models/product");

module.exports.getAllProducts = (req, res, next) => {
  Product.find().then((products) => res.send(products));
};

module.exports.getProductReviews = (req, res, next) => {
  const productId = req.params.id;
  Product.findOne({ productId }).then((product) => res.send(product.reviews));
};

module.exports.addProduct = (req, res, next) => {
  const { productId, name, description, price, stock, category, seller } =
    req.body;
  Product.create({
    productId,
    name,
    description,
    price,
    stock,
    category,
    seller,
  }).then((product) => res.send(product));
};

module.exports.addProductReview = (req, res, next) => {
  const productId = req.params.id;
  const { user, review, rating } = req.body;
  Product.findOneAndUpdate(
    { productId },
    { $push: { reviews: { review, rating, user } } },
    { new: true }
  ).then((product) => res.send(product));
};

module.exports.editProduct = (req, res, next) => {
  const productId = req.params.id;
  const { name, description, price, stock, category, seller } = req.body;
  Product.findOneAndUpdate(
    { productId },
    { name, description, price, stock, category, seller },
    { new: true }
  ).then((product) => res.send(product));
};

module.exports.editProductImage = (req, res, next) => {
  const productId = req.params.id;
  const { images } = req.body;
  Product.findOneAndUpdate(
    { productId },
    { $set: { images: images.map((link) => ({ link })) } },
    { new: true }
  ).then((product) => res.send(product));
};
