const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		status: { type: String, required: true },
		barcode: { type: Buffer, contentType: String },
		barcodeText: { type: String },
		address: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Addresses',
		},
		orderLines: { type: [mongoose.Schema.Types.ObjectId] },
		// addressAudit: {
		//   type: mongoose.Schema.Types.ObjectId,
		//   required: true,
		//   ref: "AddressesAudit",
		// },
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Order', OrderSchema, 'Orders');
