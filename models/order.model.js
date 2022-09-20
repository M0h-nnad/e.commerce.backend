const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: { type: String, required: true },
    barcode: { type: Buffer, contentType: String, required: true },
    barcodeText: { type: String, required: true },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Addresses",
    },
    // addressAudit: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "AddressesAudit",
    // },
    ordreLines:{type:[mongoose.Schema.Types.ObjectId]}
  },
  { timestamps: true }
)

module.exports = mongoose.exports('Order',OrderSchema,'Orders')