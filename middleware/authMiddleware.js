const jwt = require("jsonwebtoken");
const User = require("../models/User");
const connectDB = require("../config/db");

const protect = async (req, res, next) => {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      msg: "Token is not valid",
      error: err.message,
    });
  }
};

module.exports = protect;