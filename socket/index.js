const { createParty } = require("./controllers/party");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Example: Emit an event
    socket.emit("welcome", "Welcome to the party!");

    // Listen for create party events
    socket.on("create_party", async (newParty) => {
      try {
        console.log("new party: ", newParty);
        const party = await createParty(newParty);
        console.log("saved new party: ", party);
        io.emit("party:created", party);
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
