const Message = require("../../models/Message");

const addNewTextMessage = async (senderId, receiverId, text) => {
  try {
    const newMessage = new Message({
      title: "",
      type: "text",
      date: new Date(),
      sender: senderId,
      receiver: receiverId,
      lastMessaged: senderId,
    });
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender")
      .populate("receiver")
      .populate("lastMessaged");

    return populatedMessage;
  } catch (error) {
    console.error("add new message error: ", error);
    return null;
  }
};

module.exports = { addNewTextMessage };
