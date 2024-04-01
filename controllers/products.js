const Product = require("../models/product");

module.exports.getAllProducts = (req, res, next) => {
  Product.find().then((products) => res.send(products));
};

module.exports.addProduct = (req, res, next) => {
  const { productId, name, description, price, stock, category, seller } = req.body;
  Product.create({ productId, name, description, price, stock, category, seller }).then(
    (product) => res.send(product)
  );
};
