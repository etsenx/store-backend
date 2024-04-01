const Category = require("../models/category");

module.exports.addCategory = (req, res, next) => {
  const { name } = req.body;
  Category.create({ name }).then((category) => res.send(category));
};
