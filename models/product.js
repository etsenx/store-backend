const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
  ratings: {
    type: Number,
    default: 0,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.methods.updateRatings = async function() {
  let totalRating = 0;
  this.reviews.forEach(review => {
    totalRating += review.rating;
  });
  this.ratings = Math.round((totalRating / this.reviews.length) * 100) / 100;

  await this.save();
};


module.exports = mongoose.model("product", productSchema);
