const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name Is Required "] },
    type: {
      type: String,
      required: [true, "Type Is Required"],
      enum: {
        values: ["Billing Address", "Shipping Address"],
        message: "{VALUE} is Not Supported",
      },
    },
    isDeafult: { type: Boolean, default: false },
    addressLine1: {
      type: String,
      required: [true, "Address Line1 is Required"],
    },
    addressLine2: {
      type: String,
      required: [true, "Address Line2 is Required"],
    },
    city: { type: String, required: [true, "City Is Required"] },
    state: { type: String },
    postalCode: { type: Number, required: [true, "Postal Code Is Required"] },
    country: { type: String, required: [true, "Country Is Required"] },
    timeZone: { type: String, required: [true, "Time Zone Is Required"] },
    latitude: { type: Number },
    longitude: { type: Number },
    phone1: { type: Number, required: [true, "Phone Number Is Required"] },
    phone2: { type: Number },
    phone3: { type: Number },
    UserId : {type:mongoose.Schema.Types.ObjectId, required:true}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
