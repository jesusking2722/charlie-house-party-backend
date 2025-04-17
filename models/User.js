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
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "party",
  },
});

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "party-opened",
      "party-completed",
      "party-cancelled",
      "applicant-applied",
      "applicant-accepted",
      "applicant-rejected",
      "sticker-added",
      "sticker-bought",
      "announcement",
      "new-contact",
    ],
  },
  content: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  party: { type: mongoose.Schema.Types.ObjectId, ref: "party", default: null },
  sticker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sticker",
    default: null,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "applicant",
    default: null,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
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
  password: { type: String, required: true },
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
  country: { type: String },
  region: { type: String },
  title: { type: String },
  about: { type: String },
  rate: { type: Number, default: 0 },
  totalCompleted: { type: Number, default: 0 },
  notifications: { type: [notificationSchema], default: [] },
  status: { type: String, enum: ["online", "offline"], default: "online" },
  contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
