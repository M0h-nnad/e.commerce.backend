const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: Strinf, required: true },
  },
  { timestamps: true }
);

const ChatSchema = new mongoose.Schema(
  {
    fromPerson: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toPerson: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: { type: String, required: true },
    attachment: [AttachmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', ChatSchema)