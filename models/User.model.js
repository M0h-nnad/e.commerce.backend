const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true,'First Name Is Required'] },
    lastName: { type: String, required: [true,"Last Name Is Required"] },
    gender: {
      type: String,
      required: [true, "Gender Is Required"],
      enum: { values: ["Male", "female"], message: "{VALUE} is Not Supported" },
    },
    role: { type: mongoose.Schema.Types.ObjectId , required: [true,"Role Is Required"], ref: "Role" },
    email: {
      type: String,
      required: [true, "Email Is Required"],
      unique: [true],
    },
    password: { type: String, required: [true,'PassWord Is Required'] },
    enabled: { type: Boolean, default: false },
    addresses: { type: [mongoose.Schema.Types.ObjectId] , ref:'Address'},
   // operatorOrders:{type:[mongoose.Schema.Types.ObjectId],ref:'Orders'},
   // orderNumbers:{type:Number,max:5}
  },
  {
    timestamps: true,
    // toJSON: { getters: true, virtuals: false },
    // toObject: { getters: true, virtuals: false },
    versionKey: false,
  }
);

// UserSchema.statics.getUser = function (filter) {
//   return new Promise((resolve, reject) => {
//     this.find(filter)
//       .then((user) => resolve(user))
//       .catch((err) => reject(err));
//   });
// };

// UserSchema.statics.CreateUser = async function (userData) {
//   const hashedPass = await bcrypt.hash(userData.password, 12);
//   userData.password = hashedPass;
//   const NewUser = new this(userData);
//   try {
//     const res = await NewUser.save();
//     console.log(res);
//   } catch (err) {
//     switch (err.name) {
//       case "MongoServerError":
//         if (err.code === 11000) {
//           console.log(err);
//         console.log(Object.keys(err.keyValue));

//           console.log("Email Deprecating");
//         }
//         break;
//       case "ValidationError":
//         console.log(Object.keys(err.keyValue));
//         const errMsg = err.message.split(":")[2];
//         console.log(errMsg);
//         break;
//       }
//   }
// };

module.exports = mongoose.model("User", UserSchema, "Users");
