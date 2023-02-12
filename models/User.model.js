const mongoose = require('mongoose');
const Cart = require('./cards.model');
const Address = require('./addresses.model');
const Card = require('./cards.model');
const Favourite = require('./favourite.model');

const UserSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: [true, 'First Name Is Required'] },
		lastName: { type: String, required: [true, 'Last Name Is Required'] },
		gender: {
			type: String,
			required: [true, 'Gender Is Required'],
			enum: { values: ['Male', 'female'], message: '{VALUE} is Not Supported' },
		},
		phone: {
			type: String,
			required: true,
		},
		// role: {
		// 	type: mongoose.Schema.Types.ObjectId,
		// 	required: [true, 'Role Is Required'],
		// 	ref: 'Role',
		// },
		email: {
			type: String,
			required: [true, 'Email Is Required'],
			unique: [true],
		},
		password: { type: String, required: [true, 'Password Is Required'] },
		enabled: { type: Boolean, default: false },
		addresses: { type: [mongoose.Schema.Types.ObjectId], ref: 'Address' },
		// operatorOrders: { type: [mongoose.Schema.Types.ObjectId], ref: "Orders" },
		// orderNumbers:{type:Number,max:5}
	},
	{
		timestamps: true,
	},
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

// UserSchema.post('findOneAndDelete', async (doc, next) => {

// 	next();
// });

// UserSchema.post('save', async (doc, next) => {

// 	next();
// });

UserSchema.set('toJSON', (doc, ret) => {
	delete ret.password;
	return ret;
});

user = mongoose.model('User', UserSchema, 'Users');
user.create([
	{
		firstName: 'Mohannad',
		lastName: 'Abdellah',
		gender: 'Male',
		role: 'admin',
		email: 'identity@admin.com',
		password: '$2a$12$ObUf/T47sJpF59fYkyswV.CCMQC0Cd8pWpIhoWnssg8Csgs35mczy',
		enabled: true,
	},
]);
module.exports = user;
