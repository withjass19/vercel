const cloudinary = require("../config/cloudinary");
const Book = require("../models/book");
const connectDB = require("../config/db");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "books",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
};

exports.uploadBook = async (req, res) => {
  try {
    await connectDB();

    if (!req.file) {
      return res.status(400).json({ msg: "Image is required" });
    }

    const {
      bookName,
      author,
      originalPrice,
      sellingPrice,
      condition,
      category,
      description,
    } = req.body;

    if (!bookName || !author || !sellingPrice) {
      return res.status(400).json({
        msg: "bookName, author and sellingPrice are required",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const newBook = await Book.create({
      bookName,
      author,
      originalPrice: Number(originalPrice),
      sellingPrice: Number(sellingPrice),
      condition,
      category,
      description,
      imageUrl: result.secure_url,
      seller: req.user.id,
      available: true,
    });

    return res.status(201).json({
      msg: "Book uploaded successfully",
      book: newBook,
    });
  } catch (err) {
    console.error("Upload book error:", err);

    return res.status(500).json({
      msg: "Server error while uploading book",
      error: err.message,
    });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    await connectDB();

    const books = await Book.find()
      .populate("seller", "username email phone profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json(books);
  } catch (err) {
    return res.status(500).json({
      msg: "Failed to fetch books",
      error: err.message,
    });
  }
};

exports.getBookById = async (req, res) => {
  try {
    await connectDB();

    const book = await Book.findById(req.params.id).populate(
      "seller",
      "username email phone profileImage"
    );

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};