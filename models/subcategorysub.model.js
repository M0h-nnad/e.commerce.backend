const mongoose = require("mongoose");

const SubCategorySubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId },
});

module.exports = mongoose.model('SubCategorySub', SubCategorySubSchema);