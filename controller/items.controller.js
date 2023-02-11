const Item = require('../models/items.model');
const { SubItem } = require('../models/subItem.model');
const Category = require('../models/category.model');
const SubCategory = require('../models/subcategory.model');
const SubCategorySub = require('../models/subcategorysub.model');
const Comments = require('../models/comment.model');
const Favourite = require('../models/favourite.model');
const NotFoundException = require('../shared/error');

const fs = require('fs');
const { Rating } = require('../models/rating.model');
const conn = require('../middleware/mongo');

/* Items */

const createItem = async (req, res, next) => {
	if (req.file.cover) {
		req.body['cover'] = '/images/' + req.file.filename;
	}
	try {
		const NewItem = await new Item(req.body);
		await NewItem.save();
	} catch (err) {
		next(err);
	}
};

const UpdateItem = async (req, res, next) => {
	if (req.file.cover) {
		req.body['cover'] = '/images/' + req.file.filename;
	}
	try {
		const UpdateItem = await Item.findOneAndUpdate({ _id: req.params.id }, req.body, {
			new: true,
		});
		res.status(200).send({ messages: 'Item Update Successfully', UpdateItem });
	} catch (err) {
		if (err) next(err);
	}
};

const GetItem = async (req, res, next) => {
	const itemId = req.params.id;
	try {
		const items = await Item.find({ _id: itemId }).populate('subItems');
		res.status(200).send({ messages: 'Items Fetched Successfully ', items });
	} catch (err) {
		next(err);
	}
};

const DeleteItem = async (req, res, next) => {
	const itemId = req.params.id;
	try {
		const deletedItem = await Item.findOneAndDelete({ _id: itemId });
		const ImagePath = deletedItem.cover.split('/').shift().join('/');
		fs.unlink(ImagePath, (err) => {
			if (err) return next(err);
			console.log('Cover Is Deleted Successfully');
		});
		res.status(200).send({ messages: 'Item Deleted Successfully', itemId });
	} catch (err) {
		next(err);
	}
};

/* SubItems */

const createSubItem = async (req, res, next) => {
	if (req.files.images.length !== 0) {
		req.files.images.forEach((img) => {
			req.body['images'].push('/images/' + img.filename);
		});
	}
	if (req.files.cover.length !== 0) {
		req.body.cover = '/images/' + req.files.cover[0].filename;
	}
	const session = conn.startSession();
	try {
		const NewSubItem = await new SubItem(req.body);
		await NewSubItem.save();

		const item = await Item.findOneAndUpdate(
			{ _id: req.params.id },
			{ $addToSet: { subitems: NewSubItem._id } },
			{ new: true },
		);
		(await session).commitTransaction();
		res.status(201).send({ messages: 'SubItem Created Successfully', NewSubItem });
	} catch (e) {
		next(e);
		(await session).abortTransaction();
	}
	session.endSession();
};

const updateSubItem = async (req, res, next) => {
	if (req.files.imageslength !== 0) {
		req.files.images.forEach((img) => {
			req.body['images'].push('/images/' + img.filename);
		});
	}
	if (req.files.cover.length !== 0) {
		req.body.cover = '/images/' + req.files.cover[0].filename;
	}
	try {
		const UpdatedSubItem = await SubItem.findOneAndUpdate({ _id: req.params.id }, req.body);
		conn.collection('SubItem Audit').insertOne(UpdatedSubItem);
		res.status(200).send({ messages: 'SubItem Updated Successfully' });
	} catch (err) {
		next(err);
	}
};

const DeleteSubItem = async (req, res, next) => {
	const SubitemId = req.params.id;
	try {
		const deletedSubItem = await SubItem.findOneAndDelete({ _id: SubitemId });
		const CoverPath = deletedSubItem.cover.split('/').shift().join('/');
		fs.unlink(CoverPath, (err) => {
			if (err) next(err);
			console.log('Cover Is Deleted Successfully');
		});
		const imagesPath = deletedSubItem.images.forEach((link) => {
			fs.unlink(link, (err) => {
				if (err) next(err);
				console.log('Image Is Deleted Successfully');
			});
		});

		res.status(200).send({ messages: 'Document Deleted Successfully', SubitemId });
	} catch (err) {
		next(err);
	}
};

const GetSubItemsQuery = async (pageSize, currentPage, brand, color, size) => {
	const query = {};
	if (brand && brand.length > 0) query.brand = { $all: brand };
	if (color && color.length > 0) query['variants.color'] = { $all: color };
	if (size && size.length > 0) query['variants.sizes.size'] = { $all: size };

	const SubItems = await SubItem.aggregate([
		{
			$match: {
				$and: [query],
			},
		},
		{
			$addFields: {
				new: {
					$cond: {
						if: {
							$eq: [
								{
									$dateDiff: {
										startDate: '$createdAt',
										endDate: '$$NOW',
										unit: 'day',
									},
								},
								7,
							],
						},
						then: 'false',
						else: 'true',
					},
				},
				id: '$_id',
			},
		},
		{
			$unset: ['_id', '__v'],
		},
	])
		.skip(pageSize * (currentPage - 1))
		.limit(pageSize)
		.exec();
	const count = await SubItem.find(query).count();
	const pages = Math.ceil(count / pageSize);

	return { SubItems, count, pages };
};

const GetSubItems = async (req, res, next) => {
	try {
		const pageSize = +req.query.pageSize || 16;
		const currentPage = +req.query.currentPage || 1;
		let { brands, colors, sizes } = req.query;

		console.log(brands, colors, sizes);
		brands === 'null' ? (brands = JSON.parse(brands)) : '';
		colors === 'null' ? (colors = JSON.parse(colors)) : '';
		sizes === 'null' ? (sizes = JSON.parse(sizes)) : '';
		if (brands) brands = brands.split(',');
		if (colors) colors = colors.split(',');
		if (sizes) sizes = sizes.split(',');

		const existingSubItems = await GetSubItemsQuery(pageSize, currentPage, brands, colors, sizes);
		res.status(200).send({
			messages: 'Items Fetched Successfully',
			SubItems: existingSubItems.SubItems,
			count: existingSubItems.count,
			pages: existingSubItems.pages,
		});
	} catch (err) {
		next(err);
	}
};

const GetSubItem = async (req, res, next) => {
	const { id } = req.params;
	try {
		const subItem = await SubItem.findOne({ _id: id });
		if (!subItem) throw new NotFoundException(`item #${id} not Found`);
		res.status(200).send({ messages: 'Items Fetched Successfully', subItem });
	} catch (e) {
		next(e);
	}
};
/*Rating*/

const createRate = async (req, res, next) => {
	const { id } = req.params;
	const { rate, name, email, title, body } = req.body;
	try {
		const newRate = new Rating({ item: id, email, title, body, name, rate });
		await newRate.save();
		res.status(200).send({ messages: 'thank you for rating our product' });
	} catch (e) {
		next(e);
	}
};

/* Category */

const createCategory = async (req, res, next) => {
	try {
		const Category = await new Category(req.body.name);
		await Category.save();
		res.status(200).send({ messages: 'Category Created Successfully', Category });
	} catch (err) {
		next(err);
	}
};

const updateCategory = async (req, res, next) => {
	try {
		const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
			name: req.body.name,
		});
		res.status(200).send({ messages: 'Category Updated Successfully', updatedCategory });
	} catch (err) {
		next(err);
	}
};

const DeleteCategory = async (req, res, next) => {
	const session = await conn.startSession();
	try {
		const DeletedCategory = await Category.findByIdAndDelete(req.params.id);
		const DeleteSubCategory = await SubCategory.findOneAndDelete({
			category: req.params.id,
		});
		const DeleteSubCategorySub = await SubCategorySub.findOneAndDelete({
			subCategory: DeleteSubItem._id,
		});
		const UpdateItem = await Item.findOneAndUpdate(
			{ category: req.params.id },
			{ category: null, subCategory: null, SubCategorySub: null },
			{ new: true },
		);
		const UpdateSubItem = await SubItem.findOneAndUpdate(
			{ category: req.params.id },
			{ category: null, subCategory: null, SubCategorySub: null },
			{ new: true },
		);
		await session.commitTransaction();
		res.status(200).send({ messages: 'Category Deleted Successfully' });
	} catch (err) {
		await session.abortTransaction();

		next(err);
	}
	session.endSession();
};

const getCategories = async (req, res, next) => {
	try {
		const id = req.params.id;
		const pageSize = +req.query.pageSize;
		const currentPage = +req.query.currentPage;
		if (pageSize && currentPage) {
			const Categories = await Category.find({})
				.skip(pageSize * (currentPage - 1))
				.limit(pageSize);
			res.status(200).send({ messages: 'Categories Fetched Successfully', Categories });
		} else if (id) {
			const Categories = await Category.find({ _id: id });
			res.status(200).send({ messages: 'Categories Fetched Successfully', Categories });
		} else {
			const Categories = await Category.find({});
			res.status(200).send({ messages: 'Categories Fetched Successfully', Categories });
		}
	} catch (err) {
		next(err);
	}
};

/* SubCategories */

const CreateSubCategory = async (req, res, next) => {
	try {
		const subCategory = await new SubCategory(req.body);
		await subCategory.save();
		res.status(200).send({ messages: 'SubCategory Successfully' });
	} catch (err) {
		next(err);
	}
};

const UpdateSubCategory = async (req, res, next) => {
	try {
		const UpdateSubCategory = await SubCategory.findByIdAndUpdate(
			req.params.id,
			{ name: req.body.name },
			{ new: true },
		);
		res.status(200).send({ messages: 'SubCategory Updated Successfully' });
	} catch (err) {
		next(err);
	}
};

const DeleteSubCategory = async (req, res, next) => {
	try {
		const DeletedSubCategory = await SubCategory.findByIdAndDelete(req.params.id);
		res.send(200).status({ messages: 'Deleted Successfully' });
	} catch (err) {
		next(err);
	}
};

const getSubCategory = async (req, res, next) => {
	try {
		const id = req.params.id;
		const pageSize = +req.query.pageSize;
		const currentPage = +req.query.currentPage;
		if (pageSize && currentPage) {
			const subCategories = await SubCategory.find({})
				.skip(pageSize * (currentPage - 1))
				.limit(pageSize);
			res.status(200).send({ messages: 'SubCategory Fetched Successfully', subCategories });
		} else if (id) {
			const subCategories = await SubCategory.find({ category: req.params.id });
			res.status(200).send({ messages: 'SubCategory Fetched Successfully', subCategories });
		} else {
			const subCategories = await SubCategory.find({});
			res.status(200).send({ messages: 'SubCategory Fetched Successfully', subCategories });
		}
	} catch (err) {
		next(err);
	}
};

/* SubCategoriesSub */

const CreateSubCategorySub = async (req, res, next) => {
	try {
		const subCategorySub = await new SubCategorySub(req.body);
		await subCategorySub.save();
		res.status(200).send({ messages: 'SubCategorySub Successfully' });
	} catch (err) {
		next(err);
	}
};

const UpdateSubCategorySub = async (req, res, next) => {
	try {
		const UpdateSubCategorySub = await SubCategorySub.findByIdAndUpdate(
			req.params.id,
			{ name: req.body.name },
			{ new: true },
		);
		res.status(200).send({ messages: 'SubCategorySub Updated Successfully' });
	} catch (err) {
		next(err);
	}
};

const DeleteSubCategorySub = async (req, res, next) => {
	try {
		const DeletedSubCategorySub = await SubCategorySub.findByIdAndDelete(req.params.id);
		res.send(200).status({ messages: 'Deleted Successfully' });
	} catch (err) {
		next(err);
	}
};

const getSubCategorySub = async (req, res, next) => {
	try {
		const id = req.params.id;
		const pageSize = +req.query.pageSize;
		const currentPage = +req.query.currentPage;
		if (pageSize && currentPage) {
			const subCategories = await SubCategorySub.find({})
				.skip(pageSize * (currentPage - 1))
				.limit(pageSize);
			res.status(200).send({
				messages: 'SubCategorySub Fetched Successfully',
				subCategories,
			});
		} else if (id) {
			const subCategories = await SubCategorySub.find({
				subCategory: id,
			});
			res.status(200).send({
				messages: 'SubCategorySub Fetched Successfully',
				subCategories,
			});
		} else {
			const subCategories = await SubCategorySub.find({});
			res.status(200).send({
				messages: 'SubCategorySub Fetched Successfully',
				subCategories,
			});
		}
	} catch (err) {
		next(err);
	}
};

/* Comments */

const CreateComment = async (req, res, next) => {
	const { content, replyTo, item, shop } = req.body;
	try {
		const newComment = await new Comments({
			content,
			owner: req.decToken.UserId,
			replyTo,
			item,
			shop,
		});
		if (item) {
			const updateItem = await SubItem.updateOne(
				{ _id: item },
				{ $addToSet: { comments: newComment._id } },
			);
			await newComment.save();
			return res.status(201).send({ messages: 'Comment Created Successfully' });
		}
		const updateShop = await Shop.updateOne(
			{ _id: shop },
			{ $addToSet: { comments: newComment._id } },
		);
		await newComment.save();
		res.status(201).send({ messages: 'Comment Created Successfully' });
	} catch (err) {
		next(err);
	}
};

const updateComments = async (req, res, next) => {
	try {
		const updatedComment = await Comments.updateOne(
			{ owner: req.decToken.UserId, _id: req.params.id },
			{ content: req.body.content },
		);
		res.status(200).send({ messages: 'Comment Updated Successfully' });
	} catch (err) {
		next(err);
	}
};

const deleteComment = async (req, res, next) => {
	try {
		const deletedComment = await Comments.deleteOne({ _id: req.params.id });
		res.status(200).send({ messages: 'Comment Deleted Successfully' });
	} catch (err) {
		next(err);
	}
};

/* Shop */

const CreateShop = async (req, res, next) => {
	try {
		const newShop = await new Shop(req.body);
		await newShop.save();
		res.status(201).send({ messages: 'Shop Created Successfully', newShop });
	} catch (err) {
		next(err);
	}
};

const UpdateShop = async (req, res, next) => {
	try {
		const updatedShop = await Shop.findOneAndUpdate(
			{ _id: req.body.id, owner: req.decToken.UserId },
			req.body,
			{ new: true },
		);
		res.status(200).send({ messages: 'Shop Updated Successfully', updatedShop });
	} catch (err) {
		next(err);
	}
};

const getShops = async (req, res, next) => {
	try {
		const Shops = await Shop.find({}).populate();
		res.status(200).send({ messages: 'Shops Fetched Successfully', Shops });
	} catch (err) {
		next(err);
	}
};

const getShop = async (req, res, next) => {
	try {
		const shop = await Shop.findById(req.params.id);
		res.status(200).send({ messages: 'Shop Fetched Successfully', shop });
	} catch (err) {
		next(err);
	}
};

const getUserShop = async (req, res, next) => {
	try {
		const shop = await Shop.find({
			_id: req.params.id,
			owner: rq.decToken.UserId,
		}).populate();
		res.status(200).send({ messages: 'Shops Fetched Successfully', shop });
	} catch (err) {
		next(err);
	}
};

const getUserShops = async (req, res, next) => {
	try {
		const shops = await Shop.find({
			_id: req.params.id,
			owner: req.decToken.UserId,
		}).populate();
		res.status(200).send({ messages: 'Shops Fetched Successfully', shops });
	} catch (err) {
		next(err);
	}
};

const deleteShop = async (req, res, next) => {
	try {
		const deletedShop = await Shop.deleteOne({
			_id: req.params.id,
			owner: req.decToken.UserId,
		});
		res.status(200).send({ messages: 'Shop Deleted Successfully' });
	} catch (err) {
		next(err);
	}
};

// const addToFavourite = async (req, res, next) => {
// 	const { id } = req.params;
// 	const { UserId } = req.decToken;
// 	try {
// 		const createdObj = await Favourite.findByIdAndUpdate(
// 			{ owner: UserId },
// 			{ $addToSet: { items: id } },
// 			{ new: true },
// 		);

// 		if (!createdObj) throw new NotFoundException('User Favourite Not Found');

// 		res.status(200).send({ messages: 'Added Successfully' });
// 	} catch (e) {
// 		next(e);
// 	}
// };

module.exports = {
	items: {
		createItem,
		GetItem,
		UpdateItem,
		DeleteItem,
	},
	SubItems: {
		createSubItem,
		updateSubItem,
		DeleteSubItem,
		GetSubItems,
		GetSubItem,
	},
	category: {
		createCategory,
		updateCategory,
		DeleteCategory,
		getCategories,
	},
	subCategories: {
		CreateSubCategory,
		UpdateSubCategory,
		DeleteSubCategory,
		getSubCategory,
	},
	subCategorySub: {
		CreateSubCategorySub,
		UpdateSubCategorySub,
		DeleteSubCategorySub,
		getSubCategorySub,
	},
	comments: {
		CreateComment,
		deleteComment,
		updateComments,
	},
	shop: {
		CreateShop,
		UpdateShop,
		deleteShop,
		getUserShop,
		getUserShops,
		getShop,
		getShops,
	},
	rating: {
		createRate,
	},
};
