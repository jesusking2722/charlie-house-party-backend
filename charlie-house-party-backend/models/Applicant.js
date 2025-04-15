const mongoose = require("mongoose");
const stickerSchema = require("./Sticker");

const applicantSchema = new mongoose.Schema({
  applier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  applicant: {
    type: String,
    required: true,
    trim: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  stickers: { type: [stickerSchema], default: [] },
});

module.exports = mongoose.model("applicant", applicantSchema);
