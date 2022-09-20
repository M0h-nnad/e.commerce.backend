const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId },
    numOfReplies: { type: Number, default: 0 },
    item: { type: mongoose.Schema.Types.ObjectId },
    shop: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment',CommentsSchema)