const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const protect = require("../middleware/verifyToken");

const {
  uploadBook,
  getAllBooks,
  getBookById,
} = require("../controllers/bookController");

router.post("/upload", protect, upload.single("image"), uploadBook);

router.get("/", getAllBooks);

router.get("/:id", getBookById);

module.exports = router;