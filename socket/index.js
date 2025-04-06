module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Example: Emit an event
    socket.emit("welcome", "Welcome to the party!");

    // Listen for events
    socket.on("send_message", (message) => {
      console.log("Received message:", message);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};
