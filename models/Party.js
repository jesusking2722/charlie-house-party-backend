const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["birthday", "common", "wedding", "corporate"],
    default: "common",
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  openingAt: {
    type: Date,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "applicant",
    },
  ],
  geo: {
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("party", partySchema);
