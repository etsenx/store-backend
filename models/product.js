const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  seller: {
    type: String,
    default: "Unknown",
  },
  images: {
    type: [
      {
        link: {
          type: String,
          required: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    default: [],
  },
  reviews: {
    type: [
      {
        review: {
          type: String,
        },
        rating: {
          type: Number,
          default: 0,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("product", productSchema);
