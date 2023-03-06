const mongoose = require('mongoose');
const addresses = require('./addresses.model');

const orderSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			required: true,
			immutable: true,
			unique: true,
		},
		customerInfo: {
			firstName: { type: String },
			lastName: { type: String },
			gender: {
				type: String,
			},
			phone: {
				type: String,
			},
			email: {
				type: String,
				required: [true],
			},
			enabled: { type: Boolean },
			addresses: {
				type: [
					{
						name: { type: String, required: true },
						type: { type: String, required: true },
						email: { type: String },
						isDefault: { type: Boolean, required: true },
						addressLine1: { type: String, required: true },
						country: { type: String, required: true },
						city: { type: String, required: true },
						postalCode: { type: Number, required: true },
						state: { type: String, required: true },
						phone2: { type: Number, required: true },
						userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
						createdAt: { type: Date, required: true },
						updatedAt: { type: Date, required: true },
					},
				],
			},
		},
		productInfo: [
			{
				productId: {
					type: String,
					required: true,
				},
				name: {
					type: String,
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				variations: [
					{
						size: String,
						color: String,
						_id: false,
					},
				],
			},
		],
		paymentInfo: {
			method: {
				type: String,
				required: true,
			},
			amount: {
				type: Number,
				required: true,
			},
			transactionId: {
				type: String,
				required: true,
			},
		},
		shippingInfo: {
			method: {
				type: String,
				required: true,
			},
			cost: {
				type: Number,
				required: true,
			},
		},
		discountInfo: {
			type: Number,
		},
	},
	{ timestamps: true, strict: true },
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
