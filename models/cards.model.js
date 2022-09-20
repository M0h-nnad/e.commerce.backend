const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema(
  {
    cardNumber: { type: Number, required: true },
    expirayMonth: { type: Number, required: true },
    expirayYear: { type: Number, required: true },
    country: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    zip: { type: Number, required: true },
    state: { type: String },
    city: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", CardSchema);
