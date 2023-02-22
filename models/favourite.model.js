const mongoose = require('mongoose');

const FavouriteSchema = new mongoose.Schema(
	{
		// shop: { type: [mongoose.Schema.Types.ObjectId] },
		items: { type: [mongoose.Schema.Types.ObjectId], ref: 'SubItem' },
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Favourite', FavouriteSchema);
