const mongoose = require('mongoose');

const FabricSchema = new mongoose.Schema({
	cotton: Number,
	polyester: Number,
	lycra: Number,
	customFact: Set,
});

const SubItemsSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		subCategorySub: { type: mongoose.Schema.Types.ObjectId },
		subCategory: { type: mongoose.Schema.Types.ObjectId, required: true },
		brand: { type: String, required: true },
		images: { type: [String], required: true },
		measure: { type: [String], required: true },
		color: { type: String, required: true },
		price: { type: Number, required: true },
		cover: { type: String, required: true },
		status: { type: String, required: true },
		count: { type: String, required: true },
		tags: { type: [String] },
		comments: [mongoose.Schema.Types.ObjectId],
		offer: { type: Number },
		rating: { type: Number, required: true, default: 0 },
		ratings: { type: [mongoose.Schema.Types.ObjectId], ref: 'ratings' },
		fabric: [FabricSchema],
		shop: {
			type: monogoose.Schema.Types.ObjectId,
			ref: 'Shop',
			required: true,
		},
		description: { type: String, required: true },
	},
	{ timestamps: true },
);

module.exports = mongoose.model('SubItem', SubItemsSchema);
