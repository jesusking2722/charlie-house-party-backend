const express = require("express");
const router = express.Router();
const {
  fetchAllMessages,
  fetchSelectedMessages,
  updateMessagesRead,
} = require("../controller/messageController");

router.get("/all/:id", fetchAllMessages);
router.get("/:senderId/:receiverId", fetchSelectedMessages);
router.patch("/read", updateMessagesRead);

module.exports = router;
