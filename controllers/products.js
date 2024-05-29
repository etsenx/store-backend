const Product = require("../models/product");
const cloudinary = require("../utils/cloudinary");
const crypto = require("crypto");

module.exports.getAllProducts = (req, res, next) => {
  Product.find().then((products) => res.send(products));
};

module.exports.getProductById = (req, res, next) => {
  const productId = req.params.id;
  Product.findOne({ _id: productId }).then((product) => res.send(product));
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
    { _id: productId },
    { name, description, price, stock, category, seller },
    { new: true }
  ).then((product) => res.send(product));
};

module.exports.editProductImage = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).send({ message: "No files uploaded" });
    }
    const imageLinks = [];

    for (const file of files) {
      const publicId = crypto.randomBytes(16).toString("hex");
      const imageLink = `tripleshop/products/images/${productId}/${publicId}`;
      await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              folder: `tripleshop/products/images/${productId}`,
              public_id: publicId,
            },
            (error, uploadResult) => {
              if (error) {
                console.log(error);
                return reject(error);
              }
              imageLinks.push(imageLink);
              return resolve(uploadResult);
            }
          )
          .end(file.buffer);
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    product.images = [
      ...product.images,
      ...imageLinks.map((link) => ({ link })),
    ];

    await product.save();

    res.status(200).send(product);
  } catch (err) {
    console.log(err);
    if (err.message === "Product not found") {
      next({
        statusCode: 404,
        message: err.message,
      });
    } else {
      next(err);
    }
  }
};

module.exports.editPrimaryImage = async (req, res, next) => {
  try {
    const { productId, imageLink } = req.body;

    if (!productId || !imageLink) {
      throw new Error('Product ID and image link are required');
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const currentPrimaryImage = product.images.find(img => img.isPrimary);

    if (currentPrimaryImage) {
      currentPrimaryImage.isPrimary = false;
    }

    const newPrimaryImage = product.images.find(img => img.link === imageLink);

    if (!newPrimaryImage) {
      throw new Error('Image not found');
    }

    newPrimaryImage.isPrimary = true;

    await product.save();

    res.status(200).json({ message: 'Primary image updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteProduct = (req, res, next) => {
  const productId = req.params.id;
  Product.deleteOne({ _id: productId })
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

module.exports.deleteProductImages = async (req, res, next) => {
  try {
    const { productId, imagesLink } = req.body;

    if (!imagesLink || imagesLink.length === 0) {
      return res.status(400).send({ message: "No images to delete" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageResult = await cloudinary.v2.api.delete_resources(imagesLink, {
      type: "upload",
      resource_type: "image",
    });

    if (!imageResult) {
      throw new Error("Internal Server Error");
    }

    product.images = product.images.filter(
      (image) => !imagesLink.includes(image.link)
    );

    await product.save();

    res.status(200).json({ message: "Images deleted successfully", product });
  } catch (err) {
    next(err);
  }
};
