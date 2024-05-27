const Product = require("../models/product");

module.exports.getAllProducts = (req, res, next) => {
  Product.find().then((products) => res.send(products));
};

module.exports.getProductReviews = (req, res, next) => {
  const productId = req.params.id;
  Product.findOne({ productId }).then((product) => res.send(product.reviews));
};

module.exports.addProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, seller } = req.body;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      throw { statusCode: 400, message: "Product already exists" };
    }

    const createdProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      seller,
    });
    res.send(createdProduct);
  } catch (err) {
    next(err);
  }
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

module.exports.deleteProduct = (req, res, next) => {
  const productId = req.params.id;
  Product.deleteOne({ productId })
    .orFail()
    .then(() => {
      res.status(204).send("Product deleted successfully");
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next({
          statusCode: 404,
          message: "Product not found",
        });
      }
    });
};
