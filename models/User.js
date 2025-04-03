const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  rate: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  partyTitle: {
    type: String,
    required: true,
    trim: true,
  },
  partyType: {
    type: String,
    required: true,
    enum: ["birthday", "common", "wedding", "corporate"],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  shortname: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
    unique: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  kycVerified: {
    type: Boolean,
    default: false,
  },
  reviews: {
    type: [reviewSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  membership: {
    type: String,
    enum: ["premium", "free", null],
    default: null,
  },
  kyc: {
    sessionId: { type: String, default: null },
    sessionNumber: { type: Number, default: null },
    sessionToken: { type: String, default: null },
    vendorData: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "Not Started",
        "In Progress",
        "Completed",
        "Approved",
        "Declined",
        "Expired",
        "Abandoned",
      ],
      default: "Not Started",
    },
    url: { type: String, default: null },
  },
  membershipPeriod: { type: Number, enum: [0, 1, 3, 6, 12], default: 0 },
  country: { type: String, required: true },
  region: { type: String, required: true },
  title: { type: String, required: true },
  about: { type: String, required: true },
  rate: { type: Number, default: 0 },
  totalCompleted: { type: Number, default: 0 },
});

module.exports = mongoose.model("user", userSchema);
