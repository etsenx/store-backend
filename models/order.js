const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  orderedItems: [
    {
      products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Processing"],
    default: "Processing",
  },
  paymentStatus: {
    type: Boolean,
    default: false,
  },
});
