const mongoose = require("mongoose");

const ShopSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Name Is Required"] },
    subCategory: { type: String, required: [true, "SubCategory Is Required"] },
    category: { type: String, required: [true, "Category Is Required"] },
    rating: { type: Number, default: 0 },
    ratings: [mongoose.Schema.Types.ObjectId],
    comments: [mongoose.Schema.Types.ObjectId],
    cover: String,
    images: [String],
    discription: { type: String, required: [true, "Discription Is Required"] },
    paymentTypes: { type: [String] },
    addresses: { type: [mongoose.Schema.Types.ObjectId], ref: "Address" },
    owner: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    ShopGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "ShopGroup" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
