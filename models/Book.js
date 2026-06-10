const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookName: String,
  author: String,
  originalPrice: Number,
  sellingPrice: Number,
  condition: String,
  category: String,
  description: String,
  imageUrl: String,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
   available: {
    type: Boolean,
    default: true, // 👈 By default, available when added
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Book", bookSchema);