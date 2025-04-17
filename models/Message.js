const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["photo", "video", "audio", "file", "text"],
      required: true,
    },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["read", "waiting", "sent", "received"],
      default: "waiting",
    },
    focus: { type: Boolean, default: false },
    forwarded: { type: Boolean, default: false },
    retracted: { type: Boolean, default: false },
    photo: { type: String, default: null },
    file: { type: String, default: null },
    video: { type: String, default: null },
    audio: { type: String, default: null },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    lastMessaged: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", MessageSchema);
