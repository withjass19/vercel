const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

const {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsSeen,
} = require("../controllers/chatController");

router.post("/conversation", verifyToken, getOrCreateConversation);

router.get("/messages/:conversationId", verifyToken, getMessages);

router.post("/message", verifyToken, sendMessage);

router.patch("/messages/:conversationId/seen", verifyToken, markMessagesAsSeen);

module.exports = router;