const Message = require("../../models/Message");

const addNewTextMessage = async (senderId, receiverId, title, text) => {
  try {
    const newMessage = new Message({
      title,
      type: "text",
      date: new Date(),
      text,
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

const addNewVideoMessage = async (senderId, receiverId, title, text, video) => {
  try {
    const newMessage = new Message({
      title,
      type: "video",
      date: new Date(),
      text,
      video,
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
    console.error("add new video message error: ", error);
    return null;
  }
};

const addNewPhotoMessage = async (senderId, receiverId, title, text, photo) => {
  try {
    const newMessage = new Message({
      title,
      type: "photo",
      date: new Date(),
      text,
      photo,
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
    console.error("add new photo message error: ", error);
    return null;
  }
};

const addNewAudioMessage = async (senderId, receiverId, title, text, audio) => {
  try {
    const newMessage = new Message({
      title,
      type: "audio",
      date: new Date(),
      text,
      audio,
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
    console.error("add new audio message error: ", error);
    return null;
  }
};

const addNewFileMessage = async (senderId, receiverId, title, text, file) => {
  try {
    const newMessage = new Message({
      title,
      type: "file",
      date: new Date(),
      text,
      file,
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
    console.error("add new file message error: ", error);
    return null;
  }
};

const updateMessageRead = async (messageId) => {
  try {
    await Message.findByIdAndUpdate(messageId, {
      $set: { status: "read" },
    });
    const populatedMessage = await Message.findById(messageId)
      .populate("sender")
      .populate("receiver")
      .populate("lastMessaged");

    return populatedMessage;
  } catch (error) {
    console.error("update message read error: ", error);
    return null;
  }
};

const updateMultipleMessagesRead = async (messages) => {
  try {
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

    return updatedMessages;
  } catch (error) {
    console.error("update multiple messages read error: ", error);
    return null;
  }
};

module.exports = {
  addNewTextMessage,
  addNewAudioMessage,
  addNewFileMessage,
  addNewPhotoMessage,
  addNewVideoMessage,
  updateMessageRead,
  updateMultipleMessagesRead,
};
