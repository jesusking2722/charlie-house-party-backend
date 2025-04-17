const User = require("../models/User");
const { updateMyStatus, updateMyContact } = require("./controllers/user");
const {
  addNewPartyOpenedNotification,
  addNewAppliedNotification,
} = require("./controllers/notification");
const {
  createParty,
  addNewApplicantToSelectedParty,
} = require("./controllers/party");
const { addNewApplicant } = require("./controllers/applicant");
const { addNewTextMessage } = require("./controllers/message");

const userSocketMap = new Map();

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
      // To do: save new notification to creator user model and send to his frontend.
      io.to(userSocketId).emit("update-me", user);
    });

    socket.on("message-send:text", async (senderId, receiverId, text) => {
      const newMessage = await addNewTextMessage(senderId, receiverId, text);
      if (!newMessage) return;
      // To do: send new message to sender and receiver.
    });

    socket.on("disconnect", async () => {
      const userId = userSocketMap.get(socket.id);
      await updateMyStatus(userId, "offline");
      console.log("A user disconnected:", socket.id);
    });
  });
};
