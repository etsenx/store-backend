const Category = require("../models/category");

module.exports.addCategory = (req, res, next) => {
  const { name } = req.body;
  Category.create({ name }).then((category) => res.send(category));
};

module.exports.getAllCategories = (req, res, next) => {
  Category.find().then((allCategories) => res.send(allCategories));
};
