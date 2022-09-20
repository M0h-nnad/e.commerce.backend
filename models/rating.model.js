const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    rate: Number,
    item: { type: mongoose.Schema.Types.ObjectId, ref: "SubItem" },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "shop" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", RatingSchema);
