const OrderLine = require('../models/orderLine.model');
const Order = require('../models/order.model');
const SubItem = require('../models/subItem.model');
const Cart = require('../models/cart.model');
const conn = require('../middleware/mongo');

const bwipjs = require('bwip-js');
const OrderLineModel = require('../models/orderLine.model');
const dotEnv = require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/* Order Line */

// const addOrderLine = async (req, res, next) => {
//   let barcode;
//   try {
// const operator = await User.findOne({
//   role: "operator",
//   orderNumbers: { $lt: 5 },
// });
//     const newOrderLine = await new OrderLine({
//       item,
//       owner: req.decToken.UserId,
//       delivertIntruction,
//       deliveryDetails,
//       shop,
//     });
//     bwipjs
//       .toBuffer({
//         bcid: 'code128', // Barcode type
//         text: `http://localhost:3000/order/${newOrderLine._id}`, // Text to encode
//         scale: 3, // 3x scaling factor
//         height: 10, // Bar height, in millimeters
//       })
//       .then((png) => {
//         const buffer = new Buffer(png).toString('base64');
//         return (barcode = buffer);
//       })
//       .catch((err) => {
//         next(err);
//       });
//     newOrderLine.barcode = barcode;
//     newOrderLine.barcodeText = `http://localhost:3000/order/${newOrderLine._id}`;
//     await newOrderLine.save();
//     await Order.updateOne(
//       { _id: req.params.id },
//       { $addToSet: { orderLines: newOrderLine._id } }
//     );
//     await SubItem.findeOneAndUpdate(
//       { _id: item },
//       { $inc: { 'SubItem.count': -1 } },
//       { new: true }
//     );
//     return res.status(201).send({ messages: 'OrderLine created successfully' });
//   } catch (err) {
//     return next(err);
//   }
// };

// const DeleteOrderLine = async (req, res, next) => {
//   try {
//     const orderId = req.query.orderId;
//     const DeleteOrderLine = await OrderLine.deleteOne(req.params.id);
//     const PopFromOrder = await Order.updateOne(
//       { _id: orderId },
//       { $pull: { orderLines: req.params.id } }
//     );
//     return res.status(200).send({ messages: 'OrderLine Deleted Successfully' });
//   } catch (err) {
//     return next(err);
//   }
// };

const CreateOrder = async (req, res, next) => {
	const { owner, status, address } = req.body;
	const session = conn.startSession();
	try {
		const newOrder = await new Order({ owner, status, address });
		bwipjs
			.toBuffer({
				bcid: 'code128', // Barcode type
				text: `http://localhost:3000/order/${newOrder._id}`, // Text to encode
				scale: 3, // 3x scaling factor
				height: 10, // Bar height, in millimeters
			})
			.then((png) => {
				const buffer = new Buffer(png).toString('base64');
				barcode = buffer;
			})
			.catch((err) => {
				next(err);
			});
		newOrder.barcode = barcode;
		newOrder.barcodeText = `http://localhost:3000/order/${newOrder._id}`;

		let amount = 0;

		/* Creating OrderLines */
		const orderLines = await Cart.findOne({ owner: req.decToken._id })
			.populate({
				path: 'items',
				populate: { path: 'item' },
			})
			.exec().items;

		orderLines.forEach(async (el) => {
			newOrder.ordreLines.push(el._id);

			const exisitingOrder = await OrderLineModel.findByIdAndUpdate(el._id, {
				orderId: newOrder._id,
			});

			const updatedItem = await SubItem.findByIdAndUpdate(
				{ _id: item },
				{ $inc: { 'SubItem.count': -newOrderLine.quantity } },
			);
			amount += updatedItem.price * newOrderLine.quantity;
		});

		await newOrder.save();

		await session.commitTransaction();

		stripe.charges.create(
			{
				amount,
				currency: 'USD',
				description: 'Payment',
				source: req.body.token.id,
			},
			(err, charge) => {
				if (err) next(err);
				console.log(charge);
				return res.status(201).send({ messages: 'Order Created Successfully' });
			},
		);
	} catch (err) {
		next(err);
		await session.abortTransaction();
	}

	session.endSession();
};

const getOrders = async (req, res, next) => {
	try {
		const pageSize = +req.query.pageSize;
		const currentPage = +req.query.currentPage;
		const orderId = req.params.id;
		const userId = req.decToken.UserId;
		if (pageSize && currentPage) {
			const Orders = await Order.find({})
				.populate('ordreLines')
				.skip(pageSize * (currentPage - 1))
				.limit(pageSize);
			return res.status(200).send({ messages: 'Orders Fetched Successfully', Orders });
		} else if (orderId) {
			const Orders = await Order.find({ _id: orderId }).populate('ordreLines');
			return res.status(200).send({ messages: 'Orders Fetched Successfully', Orders });
		} else {
			const Orders = await Order.find({ owner: userId }).populate('ordreLines');
			return res.status(200).send({ messages: 'Orders Fetched Successfully', Orders });
		}
	} catch (err) {
		return next(err);
	}
};

// const getOrderLines = (req, res, next) => {
//   try {
//     const OrderLines = await OrderLine.find({ owner: req.params.id });
//     return res
//       .status(200)
//       .send({ messages: 'OrderLine Fetched Successfully', OrderLines });
//   } catch (err) {
//     return next(err);
//   }
// };

const deleteOrder = async (req, res, next) => {
	const session = await conn.startSession();
	try {
		const Order = await Order.findeOneAndDelete({ owner: req.params.id });
		if (!Order) throw new NotFoundError(`Order ${req.params.id} is Not found`);
		await OrderLine.deleteMany({ orderId: Order._id });
		await session.commitTransaction();
		res.status(200).send({ messages: 'Orders Deleted Successfully' });
	} catch (err) {
		await session.abortTransaction();
		next(err);
	}
	session.endSession();
};

// const getOrderLines = (req, res, next) => {
//   try {
//     const OrderLine = await OrderLine.find({ owner: req.params.id });
//     return res
//       .status(200)
//       .send({ messages: 'OrderLine Fetched Successfully', OrderLine });
//   } catch (err) {
//     return next(err);
//   }
// };

module.exports = {
	OrderFun: {
		CreateOrder,
		getOrders,
		deleteOrder,
	},
	// OrderLineFun: {
	//   getOrderLines,
	//   addOrderLine,
	//   DeleteOrderLine,
	// },
};
