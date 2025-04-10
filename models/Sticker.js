const mongoose = require("mongoose");
const stickerSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model("sticker", stickerSchema);
