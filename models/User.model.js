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
			trim: true,
			dropDups: true,
		},
		password: { type: String, required: [true, 'Password Is Required'] },
		enabled: { type: Boolean, default: false },
		addresses: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: 'Address',
			// validate: v => Array.isArray(v) && v.length > 0,
			// message:'error '
		},
		// operatorOrders: { type: [mongoose.Schema.Types.ObjectId], ref: "Orders" },
		// orderNumbers:{type:Number,max:5}
	},
	{
		timestamps: true,
	},
);

function arrayLimit(val) {
	console.log(val);
	return val.length <= 2;
}

user = mongoose.model('User', UserSchema, 'Users');

module.exports = user;
