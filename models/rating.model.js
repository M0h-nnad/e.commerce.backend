const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema(
	{
		rate: Number,
		item: { type: mongoose.Schema.Types.ObjectId, ref: 'SubItem' },
		// shop: { type: mongoose.Schema.Types.ObjectId, ref: "shop" },
		// owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		name: { type: String, required: true },
		email: { type: String, required: true },
		title: { type: String, required: true },
		body: { type: String, required: true },
	},
	{ timestamps: true },
);

RatingSchema.post('save', async (doc, next) => {
	const { SubItem } = require('./subItem.model');
	const existingSubItem = await SubItem.findByIdAndUpdate(doc.item, {
		$addToSet: { ratings: doc.id },
	});
	if (!existingSubItem) next(new Error('subitem not exisit'));

	next();
});
module.exports.Rating = mongoose.model('Rating', RatingSchema);
