const User = require("../models/User");
const connectDB = require("../config/db");

exports.getUsers = async (req, res) => {
  try {
    await connectDB();

    const users = await User.find({
      _id: { $ne: req.user.id },
    }).select("username email phone profileImage");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch users",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findById(req.params.id).select(
      "username email phone profileImage"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch user",
      error: error.message,
    });
  }
};