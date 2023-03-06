/* Models */

const User = require('../models/User.model');
const Address = require('../models/addresses.model');
const Card = require('../models/cards.model');
const Order = require('../models/order.model');
const Favourite = require('../models/favourite.model');
const Cart = require('../models/cart.model');
const { NotFoundError, ValidationError } = require('../shared/error');
const conn = require('../middleware/mongo');
const mongoose = require('mongoose');
/* Third Parties */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const orderLineModel = require('../models/orderLine.model');
const { SubItem } = require('../models/subItem.model');
const { Secret } = process.env;

const signUp = async (req, res, next) => {
	const { email, password, role } = req.body;
	if (!email || !password) return res.status(400).send({ messages: 'Invalid Credentials' });
	req.body.password = await bcrypt.hash(req.body.password, 12);
	const session = await mongoose.startSession();
	(await session).startTransaction();

	try {
		const newUser = await new User(req.body);

		const newCart = await new Cart({ owner: newUser._id });
		const newFavourite = await new Favourite({
			owner: newUser._id,
		});

		await newCart.save({ session });
		await newFavourite.save({ session });

		await newUser.save({ session });
		(await session).commitTransaction();
		const token = jwt.sign({ UserId: newUser._id, email: newUser.email }, Secret, {
			expiresIn: '24h',
		});
		return res
			.status(201)
			.send({ messages: 'User Created Successfully', UserDoc: newUser, token });
	} catch (err) {
		(await session).abortTransaction();
		next(err);
	} finally {
		await session.endSession();
	}
};

const logIn = async (req, res, next) => {
	let { email, password } = req.body;
	let UserDoc = await User.findOne({ email }).populate('addresses').exec();
	if (UserDoc && (await bcrypt.compare(password, UserDoc.password))) {
		const token = jwt.sign({ UserId: UserDoc._id, email: UserDoc.email }, Secret, {
			expiresIn: '24h',
		});
		return res.status(200).send({ messages: 'Logged In SuccessFully', UserDoc, token });
	}
	return res.status(404).send({ messages: 'Check your credential' });
};

const UpdateUser = async (req, res, next) => {
	try {
		const UpdatedUser = await User.findOneAndUpdate({ _id: req.decToken.UserId }, req.body, {
			new: true,
			runValidators: false,
		});

		console.log(req.decToken.UserId, req.decToken, UpdatedUser);

		if (!UpdatedUser) throw new NotFoundError('User Is Not Found');

		res.status(200).send({ messages: 'User Updated Successfully', UpdatedUser });
	} catch (err) {
		next(err);
	}
};

const UpdatePassword = async (req, res, next) => {
	const { oldPassword, confirmNewPassword, newPassword } = req.body;
	const { UserId } = req.decToken;
	try {
		if (newPassword !== confirmNewPassword) throw new ValidationError('Password is not matched');
		const exisitingUser = await User.findById(UserId);
		if (!exisitingUser) throw new NotFoundError('User is not found');

		const isTrue = await bcrypt.compare(oldPassword, exisitingUser.password);
		if (!isTrue) throw new ValidationError(`old password doesn't Match`);

		const hashedPass = await bcrypt.hash(newPassword, 12);
		const UpdatedUser = await User.findOneAndUpdate(
			{ _id: UserId },
			{ password: hashedPass },
			{ new: true },
		);

		return res.status(200).send({ messages: 'Password Updated Successfully' });
	} catch (err) {
		return next(err);
	}
};

const DeleteUser = async (req, res, next) => {
	const session = await conn.startSession();
	(await session).startTransaction();

	try {
		const DeleteUser = await User.findOneAndDelete({
			_id: req.decToken.UserId,
		});

		const DeleteAddresses = await Address.deleteMany({
			UserId: doc._id,
		});
		const DeleteCards = await Card.deleteMany({
			owner: doc._id,
		});

		const cart = await Cart.deleteMany({ owner: doc._id });

		await session.commitTransaction();
		if (!DeleteUser) throw new NotFoundError('User is not found');

		res.status(200).send({ messages: 'Deleted Successfully' });
	} catch (err) {
		next(err);
		await session.abortTransaction();
	} finally {
		session.endSession();
	}
};

const restPassword = async (req, res, next) => {};

/* Creating User Cards */

const createCards = async (req, res, next) => {
	const NewCard = await new Card(req.body);
	NewCard.save((err) => {
		if (err) return next(err);
		return res.status(201).send({ messages: 'Card added Succsessfully', Card: NewCard });
	});
};

const getUserCards = async (req, res, next) => {
	try {
		const Cards = await Card.find({ owner: req.decToken.UserId });

		return res.status(200).send({ messages: 'Retrived Successfully', Cards });
	} catch (err) {
		return next(err);
	}
};

const DeleteCards = async (req, res, next) => {
	try {
		const DeletedCard = await Card.findOneAndDelete({ _id: req.params.id });
		if (!DeletedCard) throw new NotFoundError('Card is not found');
		return res.status(200).send({ messages: 'Deleted Successfully' });
	} catch (err) {
		return next(err);
	}
};

const UpdateCard = async (req, res, next) => {
	try {
		const UpdatedCard = await Card.findOneAndUpdate({ _id: req.params.id }, req.body, {
			new: true,
		});
		if (!UpdatedCard) throw new NotFoundError('Card is not found');
		return res.status(200).send({ messages: 'Updated Successfully', UpdatedCard });
	} catch (err) {
		return next(err);
	}
};

/* Address Controller */

const GetUsersAddress = async (req, res, next) => {
	const exisitingUser = await User.findById(req.decToken.UserId).populate('addresses');

	try {
		if (!exisitingUser) throw new NotFoundError('User Is Not Found');
		res.status(200).send({
			message: 'Addresses Retrived Successfully',
			sentObject: exisitingUser.addresses,
		});
	} catch (e) {
		next(e);
	}
};

const CreateAddress = async (req, res, next) => {
	const { UserId } = req.decToken;
	const { type } = req.body;
	try {
		const user = await User.findById(UserId).populate('addresses').lean();
		if (user.addresses.length > 2) {
			throw new ValidationError('array must not be more than 2');
		}

		const index = user.addresses.findIndex((a) => a.type === type);
		if (index > -1) throw new ValidationError(`${type} is created already you should update it`);
		const NewAdd = await new Address({ ...req.body, userId: UserId });
		await NewAdd.save();
		const UpdateUser = await User.findOneAndUpdate(
			{ _id: UserId },
			{ $addToSet: { addresses: NewAdd._id } },
			{ new: true, runValidators: true },
		);

		if (!UpdateUser) throw new NotFoundError('User is not found');
		res.status(201).send({ messages: 'Address Created Successfully' });
	} catch (err) {
		next(err);
	}
};

const UpdateAddress = async (req, res, next) => {
	try {
		const UpdateAddress = await Address.findOneAndUpdate(
			{ _id: req.params.id, UserId: req.decToken.UserId },
			req.body,
			{
				new: true,
			},
		);

		if (!UpdateAddress) throw NotFoundError('Address is not found in your account');
		res.status(200).send({ messages: 'Updated Successfully', UpdateAddress });
	} catch (err) {
		next(err);
	}
};

const DeleteAddress = async (req, res, next) => {
	try {
		const id = req.params.id;
		const DeleteAddress = await Address.findOneAndDelete({
			_id: id,
			UserId: req.decToken.UserId,
		});

		if (DeleteAddress) throw NotFoundError('Address is not found in your account');

		res.status(200).send({
			messages: 'Address Deleted Successfully',
			UpdatedUser,
			AddressId: id,
		});
	} catch (err) {
		next(err);
	}
};

/* Role */

// const CreateRole = async (req, res, next) => {
// 	try {
// 		const NewRole = await new Role(req.body);
// 		NewRole.save((err) => {
// 			if (err) return next(err);
// 			return res.status(200).send({ messages: 'Role Created Successfully', NewRole });
// 		});
// 	} catch (err) {
// 		return next(err);
// 	}
// };

// const AddRole = async (req, res, next) => {
// 	try {
// 		const role = await Role.findOne({ _id: req.body.id });
// 		const UpdateUser = await User.findByIdAndUpdate(req.decToken.UserId, {
// 			role: role.name,
// 		});
// 		return res.status(200).send({ messages: 'Role Added to User Successfully', UpdateUser });
// 	} catch (err) {
// 		return next(err);
// 	}
// };

// const UpdateRole = (req, res, next) => {
// 	// Just Testing My knowleage in Using normal Promises In mongoose Queries
// 	const UpdatedRole = Role.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true })
// 		.exec()
// 		.then((d) => {
// 			return res.status(200).send({ messages: 'Role Updated Successfully', Role: d });
// 		})
// 		.catch((err) => next(err));
// };

// const GetRoles = async (req, res, next) => {
// 	try {
// 		const roles = await Roles.find({});
// 		return res.status(200).send({ messages: 'Roles Fetched Successfully', Roles: roles });
// 	} catch (err) {
// 		return next(err);
// 	}
// };

// const DeleteRole = async (req, res, next) => {
// 	try {
// 		const DelRole = await Role.findOneAndDeleteOne({ _id: req.params.id });
// 		const UpdateUser = await User.findOneAndUpdateOne(
// 			{ role: DelRole._id },
// 			{ role: null },
// 			{ new: true },
// 		);
// 		return res.status(200).send({
// 			messages: 'Role Deleted Successfully',
// 			RoleId: DelRole._id,
// 			UpdateUser,
// 		});
// 	} catch (err) {
// 		return next(err);
// 	}
// };

/* Favourite  */

const getFavourite = async (req, res, next) => {
	const { UserId } = req.decToken;
	try {
		const exisitingFavourite = await Favourite.findOne({ owner: UserId })
			.populate('items')
			.exec();

		res.status(200).send({ messages: 'Operation done', sentObject: exisitingFavourite });
	} catch (e) {
		next(e);
	}
};

const addToFavourite = async (req, res, next) => {
	try {
		const updatedFavourite = await Favourite.findOneAndUpdate(
			{ owner: req.decToken.UserId },
			{ $addToSet: { items: req.params.id } },
			{ new: true },
		);
		if (!updatedFavourite) throw new NotFoundError('User Favourite not found');
		return res.status(200).send({ messages: 'Updated Successfully' });
	} catch (err) {
		return next(err);
	}
};

const deleteFromFavourite = async (req, res, next) => {
	try {
		const updateFavourite = await Favourite.updateOne(
			{ owner: req.decToken.UserId },
			{ $pull: { items: req.params.id } },
		);

		if (!updateFavourite) throw new NotFoundError('User Favourite not found');
		res.status(200).send({ messages: 'Deleted Successfully' });
	} catch (err) {
		return next(err);
	}
};

const getCartItemsAggregateFunction = async (userId, session = null) => {
	const cart = await Cart.aggregate([
		{
			$match: {
				owner: mongoose.Types.ObjectId(userId),
			},
		},
		{
			$unwind: '$items',
		},
		{
			$lookup: {
				from: orderLineModel.collection.name,
				localField: 'items',
				foreignField: '_id',
				as: 'itemsObj',
			},
		},
		{
			$lookup: {
				from: SubItem.collection.name,
				localField: 'itemsObj.item',
				foreignField: '_id',
				as: 'item',
			},
		},
		{
			$unwind: '$item',
		},
		{
			$unwind: '$itemsObj',
		},
		{
			$group: {
				_id: '$itemsObj',
				item: { $first: '$item' },
				variant: {
					$first: {
						$filter: {
							input: '$item.variants',
							cond: { $eq: ['$$this._id', '$itemsObj.variants'] },
						},
					},
				},
				orderId: { $first: '$itemsObj.orderId' },
				sizeId: {
					$first: '$itemsObj.sizeId',
				},
				quantity: { $first: '$itemsObj.quantity' },
			},
		},
		{
			$unwind: '$variant',
		},
		{
			$group: {
				_id: '$sizeId',
				item: { $first: '$item' },
				variant: { $first: '$variant' },
				size: {
					$first: {
						$filter: {
							input: '$variant.sizes',
							cond: { $eq: ['$$this._id', '$sizeId'] },
						},
					},
				},
				orderId: { $first: '$orderId' },
				quantity: { $first: '$quantity' },
			},
		},
		{
			$unwind: '$size',
		},
		{
			$project: {
				'item.name': 1,
				'item.price': 1,
				'item.offer': 1,
				'item._id': 1,
				'variant._id': 1,
				'variant.color': 1,
				'variant.src': 1,
				size: 1,
				quantity: 1,
				orderId: 1,
			},
		},
	]).session(session);

	return cart;
};

/* Cart */

const getCartItems = async (req, res, next) => {
	const { UserId } = req.decToken;
	try {
		const cart = await getCartItemsAggregateFunction(UserId, null);

		res.status(200).send({ message: 'operation successfully', sentObject: cart });
	} catch (e) {
		next(e);
	}
};

const addToCart = async (req, res, next) => {
	const { id } = req.params;
	const { quantity, varaintId, sizeId } = req.body;
	const { UserId } = req.decToken;
	const session = await conn.startSession();
	await session.startTransaction();

	try {
		const existingOrderLine = await orderLineModel
			.findOne({
				item: id,
				owner: UserId,
				variants: varaintId,
				sizeId: sizeId,
			})
			.session(session);

		if (existingOrderLine) throw new ValidationError('Item Already in the cart');
		const existingOrder = await Order.findOne({ owner: UserId });
		let order;
		if (!existingOrder) {
			order = new Order({
				owner: UserId,
				status: 'pending',
				orderLines: [],
			});
			await order.save({ session });
		}

		const orderLine = await new orderLineModel({
			item: id,
			quantity: quantity || 1,
			owner: UserId,
			variants: varaintId,
			sizeId: sizeId,
			orderId: order?._id ?? existingOrder._id,
		});

		await orderLine.save({ session });
		existingOrder.orderLines.push(orderLine._id);
		existingOrder.save({ session });
		const cart = await Cart.findOneAndUpdate(
			{ owner: req.decToken.UserId },
			{ $addToSet: { items: orderLine._id } },
			{ new: true },
		).session(session);

		await session.commitTransaction();
		if (!cart) throw new NotFoundError('User Cart is not found');
		res.status(200).send({ messages: 'Item Added Successfully' });
	} catch (err) {
		next(err);
		(await session).abortTransaction;
	} finally {
		(await session).endSession();
	}
};

const deleteFromCart = async (req, res, next) => {
	const { id } = req.params;
	const { UserId } = req.decToken;
	const session = await conn.startSession();
	await session.startTransaction();
	try {
		const cart = await Cart.findOneAndUpdate(
			{ owner: UserId },
			{ $pull: { item: id } },
			{ new: true },
		).session(session);

		const deleteOrder = await orderLineModel.findByIdAndDelete(id).session(session);

		const order = await Order.findOneAndUpdate(
			{ owner: UserId },
			{ $pull: { orderLines: id } },
			{ new: true },
		);

		await session.commitTransaction();

		if (!cart) throw new NotFoundError('User Cart is not found');
		if (!deleteOrder) throw new NotFoundError('OrderLine in not defiend');
		if (!order) throw new NotFoundError('Order in not defiend');

		res.status(200).send({ messages: 'Item Deleted Successfully' });
	} catch (err) {
		next(err);
		await session.abortTransaction;
	} finally {
		await session.endSession();
	}
};

const updateQuantity = async (req, res, next) => {
	const { id } = req.params;
	const { UserId } = req.decToken;
	const { quantity } = req.body;

	try {
		const existingOrderLine = await orderLineModel.findOneAndUpdate(
			{ _id: id, owner: UserId },
			{
				quantity,
			},
			{ new: true },
		);

		if (!existingOrderLine) throw new NotFoundError(`Order #${id} not found`);

		res.status(200).send({ message: 'Updated Successfully' });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	User: {
		signUp,
		logIn,
		DeleteUser,
		UpdateUser,
		UpdatePassword,
	},
	Cards: {
		getUserCards,
		createCards,
		DeleteCards,
		UpdateCard,
	},
	Address: {
		GetUsersAddress,
		CreateAddress,
		DeleteAddress,
		UpdateAddress,
	},
	// Roles: {
	// 	GetRoles,
	// 	DeleteRole,
	// 	CreateRole,
	// 	UpdateRole,
	// 	AddRole,
	// },
	Cart: {
		addToCart,
		getCartItems,
		deleteFromCart,
		updateQuantity,
		getCartItemsAggregateFunction,
	},
	Favourite: {
		addToFavourite,
		deleteFromFavourite,
		getFavourite,
	},
};
