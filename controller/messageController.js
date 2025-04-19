const Message = require("../models/Message");

const fetchAllMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find()
      .populate("sender")
      .populate("receiver")
      .populate("lastMessaged");
    const selectedMessages = messages.filter(
      (message) =>
        message.sender._id.toString() === id ||
        message.receiver._id.toString() === id
    );
    res.json({ ok: true, data: { messages: selectedMessages } });
  } catch (error) {
    console.error("fetch all messages error: ", error);
    res.status(500).json("Server error");
  }
};

const fetchSelectedMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find()
      .populate("sender")
      .populate("receiver")
      .populate("lastMessaged");

    const selectedMessages = messages.filter(
      (message) =>
        message.sender._id.toString() === senderId &&
        message.receiver._id.toString() === receiverId
    );

    res.json({ ok: true, data: { messages: selectedMessages } });
  } catch (error) {
    console.error("fetch selected messages error: ", error);
    res.status(500).json("Server error");
  }
};

const updateMessagesRead = async (req, res) => {
  try {
    const { messages } = req.body;
    await Promise.all(
      messages.map((message) =>
        Message.findByIdAndUpdate(message._id, {
          $set: { status: "read" },
        })
      )
    );
    const messageIds = messages.map((msg) => msg._id);
    const updatedMessages = await Message.find({ _id: { $in: messageIds } })
      .populate("sender")
      .populate("receiver")
      .populate("lastMessaged");

    res.json({ ok: true, data: { messages: updatedMessages } });
  } catch (error) {
    console.error("update message read error: ", error);
    res.status(500).json("Server error");
  }
};

module.exports = {
  fetchAllMessages,
  fetchSelectedMessages,
  updateMessagesRead,
};
