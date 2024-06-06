const Category = require("../models/category");

module.exports.getCategories = async (req, res, next) => {
  try {
    let query = Category.find();

    if (req.query.ids) {
      const categoryIds = req.query.ids.split(',');
      query = query.where('_id').in(categoryIds);
    }

    const allCategories = await query.select('name _id').exec();
    res.send(allCategories);
  } catch (err) {
    next(err);
  }
};

module.exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id })
      .orFail()
      .select("name")
      .select("_id");
    res.send(category);
  } catch (err) {
    next(err);
  }
};

module.exports.addCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw { statusCode: 400, message: "Category already exists" };
    }

    const category = await Category.create({ name });
    res.send({
      name: category.name,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.updateCategoryName = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw { statusCode: 400, message: "Category already exists" };
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      { name },
      { new: true }
    );

    if (!updatedCategory) {
      throw { statusCode: 404, message: "Category not found" };
    }
    res.status(200).send({
      name: updatedCategory.name,
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

module.exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    await Category.deleteOne({ _id: categoryId }).orFail();
    res.status(204).send("Category deleted successfully");
  } catch (err) {
    if (err.name === "DocumentNotFoundError") {
      next({
        statusCode: 404,
        message: "Category not found",
      });
    } else {
      next(err);
    }
  }
};
