const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  getProfile,
  changePassword,
  uploadProfileImage,
  getProfileImage,
} = require("../controllers/authController");

const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/multer");

router.post("/signup", signUp);
router.post("/signin", signIn);

router.get("/profile", verifyToken, getProfile);

router.post(
  "/change-password",
  verifyToken,
  changePassword
);

router.post(
  "/upload-profile-image",
  verifyToken,
  upload.single("image"),
  uploadProfileImage
);

router.get(
  "/profile-image",
  verifyToken,
  getProfileImage
);

module.exports = router;