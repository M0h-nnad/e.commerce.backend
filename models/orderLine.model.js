const mongoose = require("mongoose");

const OrderLineSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubItem",
    },
    orderId: [mongoose.Schema.Types.ObjectId],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // operator: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User",
    // },
    // audit: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "SubItemAudit",
    // },
    barcode: { type: Buffer, contentType: String },
    barcodeText: { type: String },
    deliveryIntructions: { type: String },
    deliveryDetails: { type: Map },
    shop: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Shop" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderLine", OrderLineSchema);
