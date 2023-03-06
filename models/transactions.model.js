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
						phone2: { type: Number },
						userId: { type: mongoose.Schema.Types.ObjectId },
						createdAt: { type: Date, required: true },
						updatedAt: { type: Date, required: true },
					},
				],
			},
		},
		productInfo: [
			{
				_id: { type: String, required: true },
				item: {
					_id: { type: String, required: true },
					name: { type: String, required: true },
					offer: { type: Number, required: true },
					price: { type: Number, required: true },
				},
				variant: {
					_id: { type: String, required: true },
					color: { type: String, required: true },
					src: { type: String, required: true },
				},
				size: {
					_id: { type: String, required: true },
					number: { type: Number, required: true },
					size: { type: String, required: true },
				},
				orderId: { type: String, required: true },
				quantity: { type: Number, required: true },
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

const transaction = mongoose.model('transaction', orderSchema);

module.exports = transaction;
