const mongoose = require('mongoose');
const Rating = require('./rating.model');
// const FabricSchema = new mongoose.Schema({
// 	cotton: Number,
// 	polyester: Number,
// 	lycra: Number,
// 	customFact: Set,
// });

const SubItemsSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		subCategorySub: { type: mongoose.Schema.Types.ObjectId },
		subCategory: { type: mongoose.Schema.Types.ObjectId, required: true },
		brand: { type: String, required: true },
		variants: {
			type: [
				{
					color: String,
					src: String,
					sizes: {
						type: [
							{
								size: String,
								number: Number,
							},
						],
					},
				},
			],
			required: true,
		},
		price: { type: Number, required: true },
		tags: { type: [String] },
		onsale: Boolean,
		description: { type: String },

		offer: { type: Number },
		// rating: { type: Number, required: true, default: 0 },
		ratings: { type: [mongoose.Schema.Types.ObjectId], ref: 'ratings' },
		// measure: { type: [String], required: true },
		// color: { type: String, required: true },
		// comments: [mongoose.Schema.Types.ObjectId],
		// fabric: [FabricSchema],
		// shop: {
		// 	type: monogoose.Schema.Types.ObjectId,
		// 	ref: 'Shop',
		// 	required: true,
		// },
		// description: { type: String, required: true },
	},
	{
		timestamps: true,
	},
);

SubItemsSchema.pre('findOneAndDelete', async (doc, next) => {
	const deleteRatings = await Rating.deleteMany({ item: doc._id });

	next();
});

module.exports = mongoose.model('SubItem', SubItemsSchema);
