const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const connectDB = require("../config/db");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.signUp = async (req, res) => {
  try {
    await connectDB();

    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "User with this email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      msg: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage?.url || "",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      msg: "Server error during sign up",
      error: err.message,
    });
  }
};

exports.signIn = async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage?.url || "",
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({
      msg: "Server error during sign in",
      error: err.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.user.id).select(
      "username email phone profileImage"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage?.url || "",
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    await connectDB();

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        msg: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      msg: "Password updated successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    await connectDB();

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.profileImage?.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "user_profiles",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });
    };

    const result = await uploadToCloudinary();

    user.profileImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await user.save();

    return res.status(200).json({
      msg: "Profile image uploaded successfully",
      url: result.secure_url,
    });
  } catch (err) {
    console.error("Image upload error:", err);
    return res.status(500).json({
      msg: "Image upload failed",
      error: err.message,
    });
  }
};

exports.getProfileImage = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.user.id).select("profileImage");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({
      url: user.profileImage?.url || "",
    });
  } catch (err) {
    console.error("Get profile image error:", err);
    return res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};