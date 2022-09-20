const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cover: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    subCategory: {
      type: monoogse.Schema.types.ObjectId,
      required: true,
      ref: "SubCategory",
    },
    subCategorySub: {
      type: monoogse.Schema.types.ObjectId,
      required: true,
      ref: "SubCategorySub",
    },
    shop: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Shop" },
    subItems: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "SubItems",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', ItemSchema)