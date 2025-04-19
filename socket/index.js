const User = require("../models/User");
const {
  updateMyStatus,
  updateMyContact,
  updateReceiverContact,
} = require("./controllers/user");
const {
  addNewPartyOpenedNotification,
  addNewAppliedNotification,
} = require("./controllers/notification");
const {
  createParty,
  addNewApplicantToSelectedParty,
} = require("./controllers/party");
const { addNewApplicant } = require("./controllers/applicant");
const {
  addNewTextMessage,
  updateMessageRead,
  updateMultipleMessagesRead,
  addNewPhotoMessage,
  addNewVideoMessage,
  addNewAudioMessage,
  addNewFileMessage,
} = require("./controllers/message");
const fs = require("fs");
const path = require("path");
const { getFileCategory } = require("../helper");

const userSocketMap = new Map();

const uploadDir = path.join(__dirname, "../uploads/files");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("login", async (userId) => {
      userSocketMap.set(userId, socket.id);
      await updateMyStatus(userId, "online");
      console.log(userSocketMap);
    });

    socket.on("party:creating", async (newParty, myId) => {
      try {
        const party = await createParty(newParty);
        const newNotification = {
          type: "party-opened",
          party,
        };

        // Store notification in database for all users
        await addNewPartyOpenedNotification(newNotification, myId);

        // Emit the party creation event
        io.emit("party:created", party);

        // Send real-time notification to online users
        const users = await User.find({ _id: { $ne: myId } });
        users.forEach((user) => {
          const userSocketId = userSocketMap.get(user._id.toString());
          if (userSocketId) {
            io.to(userSocketId).emit("notification", newNotification);
          }
        });
      } catch (error) {
        console.error("Error creating party:", error);
        socket.emit("error", "Failed to create party");
      }
    });

    socket.on(
      "creating:applicant",
      async (newApplicant, partyId, creatorId) => {
        try {
          const applicant = await addNewApplicant(newApplicant);
          const party = await addNewApplicantToSelectedParty(
            applicant,
            partyId
          );
          const newNotification = {
            type: "applicant-applied",
            applicant,
            party,
          };
          await addNewAppliedNotification(newNotification, creatorId);
          io.emit("applicant:created", applicant, partyId);
          const creatorSocketId = userSocketMap.get(creatorId.toString());
          io.to(creatorSocketId).emit("notification", newNotification);
        } catch (error) {
          console.error("Error creating applicant: ", error);
          socket.emit("error", "Failed to create applicant");
        }
      }
    );

    socket.on("direct-party-apply", async (creatorId, userId) => {
      const user = await updateMyContact(creatorId, userId);
      if (typeof user === "boolean" && user) return;
      const userSocketId = userSocketMap.get(userId.toString());
      io.to(userSocketId).emit("update-me", user);
    });

    // messages
    socket.on(
      "message-send:text",
      async (senderId, receiverId, title, text) => {
        const newMessage = await addNewTextMessage(
          senderId,
          receiverId,
          title,
          text
        );
        if (!newMessage) return;
        const updatedReceiver = await updateReceiverContact(
          receiverId,
          senderId
        );
        const senderSocketId = userSocketMap.get(senderId.toString());
        const receiverSocketId = userSocketMap.get(receiverId.toString());
        io.to(senderSocketId).emit("message-received:text", newMessage);
        io.to(receiverSocketId).emit(
          "message-received:text",
          newMessage,
          senderId,
          newMessage._id
        );
        if (
          (typeof updatedReceiver === "boolean" && updatedReceiver) ||
          !updatedReceiver
        )
          return;
        io.to(receiverSocketId).emit("update-me", updatedReceiver);
      }
    );

    socket.on(
      "message-send:files",
      async (senderId, receiverId, title, text, files) => {
        console.log(files);
        const uploadedFilePaths = await Promise.all(
          files.map(async (file) => {
            const filename = Date.now() + "_" + file.name;
            const buffer = Buffer.from(file.data);
            const filePath = path.join(uploadDir, filename);

            console.log(buffer);

            await fs.promises.writeFile(filePath, buffer);

            return {
              path: `/uploads/files/${filename}`,
              type: file.type,
            };
          })
        );

        const savedMessages = await Promise.all(
          uploadedFilePaths.map(async (file) => {
            const fileType = getFileCategory(file.type);

            switch (fileType) {
              case "photo":
                return await addNewPhotoMessage(
                  senderId,
                  receiverId,
                  title,
                  text,
                  file.path
                );
              case "video":
                return await addNewVideoMessage(
                  senderId,
                  receiverId,
                  title,
                  text,
                  file.path
                );
              case "audio":
                return await addNewAudioMessage(
                  senderId,
                  receiverId,
                  title,
                  text,
                  file.path
                );
              case "file":
                return await addNewFileMessage(
                  senderId,
                  receiverId,
                  title,
                  text,
                  file.path
                );
              default:
                return null;
            }
          })
        );

        const messages = savedMessages.filter(Boolean);
        if (messages.length === 0) return;
        const senderSocketId = userSocketMap.get(senderId.toString());
        const receiverSocketId = userSocketMap.get(receiverId.toString());
        io.to(senderSocketId).emit("message-received:files", messages);
        io.to(receiverSocketId).emit(
          "message-received:files",
          messages,
          senderId,
          messages[messages.length - 1]._id
        );
        const updatedReceiver = await updateReceiverContact(
          receiverId,
          senderId
        );
        if (
          (typeof updatedReceiver === "boolean" && updatedReceiver) ||
          !updatedReceiver
        )
          return;
        io.to(receiverSocketId).emit("update-me", updatedReceiver);
      }
    );

    socket.on("message:multiple-update-read", async (messages) => {
      const updatedMessages = await updateMultipleMessagesRead(messages);
      if (!updatedMessages) return;

      // send updated read messages to send and receiver
      const senderSocketId = userSocketMap.get(
        updatedMessages[0].sender._id.toString()
      );

      const receiverSocketId = userSocketMap.get(
        updatedMessages[0].receiver._id.toString()
      );

      io.to(senderSocketId).emit(
        "message:updated-multiple-read",
        updatedMessages
      );
      io.to(receiverSocketId).emit(
        "message:updated-multiple-read",
        updatedMessages
      );
    });

    socket.on("message:read", async (messageId) => {
      const updatedMessage = await updateMessageRead(messageId);
      if (!updatedMessage) return;

      const senderSocketId = userSocketMap.get(
        updatedMessage.sender._id.toString()
      );

      const receiverSocketId = userSocketMap.get(
        updatedMessage.receiver._id.toString()
      );

      // send updated read message to sender and receiver
      io.to(senderSocketId).emit("message:update", updatedMessage);
      io.to(receiverSocketId).emit("message:update", updatedMessage);
    });

    // message typing socket handle
    socket.on("message:start-typing", async (receiverId, sender) => {
      const receiverSocketId = userSocketMap.get(receiverId.toString());
      io.to(receiverSocketId).emit("message:user-typing", sender);
    });

    socket.on("message:stop-typing", async (receiverId) => {
      const receiverSocketId = userSocketMap.get(receiverId.toString());
      io.to(receiverSocketId).emit("message:user-typing", null);
    });

    socket.on("disconnect", async () => {
      const userId = userSocketMap.get(socket.id);
      await updateMyStatus(userId, "offline");
      console.log("A user disconnected:", socket.id);
    });
  });
};
