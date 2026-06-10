const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const { getUsers, getUserById } = require("../controllers/userControler");

router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUserById);

module.exports = router;