const Product = require("../models/product");
const cloudinary = require("../utils/cloudinary");
const crypto = require("crypto");
const mongoose = require("mongoose");

module.exports.getProducts = async (req, res, next) => {
  try {
    const searchTerm = req.query.term;
    const limit = parseInt(req.query.limit) || 0;

    const pipeline = [
      { $sort: { createdAt: -1 } },
      {
        $project: {
          reviewsLength: { $size: "$reviews" },
          otherFields: {
            $filter: {
              input: { $objectToArray: "$$ROOT" },
              cond: {
                $not: {
                  $in: ["$$this.k", ["reviews"]]
                }
              }
            }
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              { _id: "$_id", totalReviews: "$reviewsLength" },
              { $arrayToObject: "$otherFields" }
            ]
          }
        }
      }
    ];
    
    
    if (searchTerm) {
      pipeline.unshift({
        $match: {
          name: { $regex: searchTerm, $options: "i" },
        },
      });
    }

    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }

    const products = await Product.aggregate(pipeline).exec();
    res.send(products);
  } catch (err) {
    next(err);
  }
};

module.exports.getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId }).select(
      "-reviews"
    );
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.send(product);
  } catch (error) {
    next(error);
  }
};

module.exports.getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const skip = (page - 1) * limit;
    // const product = await Product.aggregate([
    //   { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    //   { $project: {
    //       totalReviews: { $size: "$reviews" },
    //       reviews: { $slice: ["$reviews", skip, limit] }
    //     }
    //   }
    // ]);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // const reviews = product[0].reviews.slice(skip, skip + limit);
    // const hasMore = skip + limit < product[0].totalReviews;

    res.send({ reviews: product.reviews });
  } catch (error) {
    next(error);
  }
};


module.exports.getAverageRating = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const averageRating = product.averageRating;

    res.json({ averageRating });
  } catch (err) {
    next(err);
  }
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

module.exports.addProductReview = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { review, rating } = req.body;
    const userId = req.user._id;
    const product = await Product.findOneAndUpdate(
      { _id: productId },
      { $push: { reviews: { review, rating, user: userId } } },
      { new: true }
    );
    if (product) {
      await product.updateRatings();
      res.send(product);
    }
  } catch (err) {
    next(err);
  }
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
      throw new Error("Product ID and image link are required");
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const currentPrimaryImage = product.images.find((img) => img.isPrimary);

    if (currentPrimaryImage) {
      currentPrimaryImage.isPrimary = false;
    }

    const newPrimaryImage = product.images.find(
      (img) => img.link === imageLink
    );

    if (!newPrimaryImage) {
      throw new Error("Image not found");
    }

    newPrimaryImage.isPrimary = true;

    await product.save();

    res.status(200).json({ message: "Primary image updated successfully" });
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
