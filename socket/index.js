const User = require("../models/User");
const { addNewPartyOpenedNotification } = require("./controllers/notification");
const { createParty } = require("./controllers/party");

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
        await addNewPartyOpenedNotification(
          {
            type: "party-opened",
            party: party._id,
          },
          myId
        );
        io.emit("party:created", party);
        const newNotification = {
          type: "party-opened",
          party,
        };
        const users = await User.find({ _id: { $ne: myId } });
        users.forEach((user) => {
          console.log(user._id.toString());
          const userSocketId = userSocketMap.get(user._id.toString());
          if (userSocketId) {
            io.to(userSocketId).emit(
              "notification:party-opened",
              newNotification
            );
          }
        });
      } catch (err) {
        console.error("Error creating party:", err);
        socket.emit("error", "Failed to create party");
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};
