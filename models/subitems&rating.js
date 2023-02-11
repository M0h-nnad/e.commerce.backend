// const { SubItem } = require('./subItem.model');
// const { Rating } = require('./rating.model');

// SubItemsSchema.pre('findOneAndDelete', async (doc, next) => {
// 	const deleteRatings = await Rating.deleteMany({ item: doc._id });

// 	next();
// });

// RatingSchema.post('save', async (doc, next) => {
// 	const existingSubItem = await SubItem.findById(doc.item);
// 	if (!existingSubItem) next(new Error('subitem not exisit'));

// 	next();
// });


