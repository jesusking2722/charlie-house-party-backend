const User = require("../models/User");
const {
  addNewPartyOpenedNotification,
  addNewAppliedNotification,
} = require("./controllers/notification");
const {
  createParty,
  addNewApplicantToSelectedParty,
} = require("./controllers/party");
const { addNewApplicant } = require("./controllers/applicant");

const userSocketMap = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("login", (userId) => {
      userSocketMap.set(userId, socket.id);
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
          console.log(creatorSocketId);
          io.to(creatorSocketId).emit("notification", newNotification);
        } catch (error) {
          console.error("Error creating applicant: ", error);
          socket.emit("error", "Failed to create applicant");
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};
