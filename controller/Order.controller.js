const OrderLine = require('../models/orderLine.model');
const Order = require('../models/order.model');
const { SubItem } = require('../models/subItem.model');
const userController = require('../controller/User.contoller');
const conn = require('../middleware/mongo');
const Address = require('../models/addresses.model');
const { NotFoundError, ValidationError } = require('../shared/error');

const bwipjs = require('bwip-js');
const OrderLineModel = require('../models/orderLine.model');
const Cart = require('../models/cart.model');
const dotEnv = require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const transactionModel = require('../models/transactions.model');
const userModel = require('../models/User.model');
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
	const { owner, status, address, payment, token } = req.body;
	const { UserId } = req.decToken;
	const session = await conn.startSession();
	await session.startTransaction();

	try {
		const cart = await userController.Cart.getCartItemsAggregateFunction(UserId, session);
		const user = await userModel.findById(UserId).populate('addresses').session(session);
		// const addresses = await Address.find({ userId: UserId }).session(session);
		if (user.addresses.length < 2)
			throw new ValidationError('please add your addresses before placing order');
		if (cart.length === 0) throw new ValidationError('your cart is empty');
		const amount = cart.reduce((total, obj) => {
			const itemPrice = obj.item.price - obj.item.offer;
			return total + itemPrice * obj.quantity;
		}, 0);
		const promises = cart.map(async (el) => {
			const subItem = await SubItem.findOneAndUpdate(
				{
					_id: el.item.id,
					variants: {
						$elemMatch: {
							_id: el.variant._id,
							sizes: {
								$elemMatch: {
									_id: el.size._id,
									number: { $gte: el.quantity },
								},
							},
						},
					},
				},
				{
					$inc: { 'variants.$[i].sizes.$[j].number': -el.quantity },
				},
				{
					arrayFilters: [{ 'i._id': el.variant._id }, { 'j._id': el.size._id }],
					new: true,
					useFindAndModify: false,
					session: session,
				},
			).lean();

			if (subItem) {
				return;
			} else {
				throw new ValidationError(`item ${el.item.name} size ${el.size.size} is out of stock`);
			}
		});

		await Promise.all(promises);

		const order = await Order.findByIdAndUpdate(
			cart[0].orderId,
			{
				$set: { status: 'processing' },
			},
			{ new: true },
		).session(session);

		if (!order) throw new ValidationError('Order is not found');

		const charges = await stripe.charges.create({
			amount,
			currency: 'USD',
			description: 'Payment',
			source: token.id,
		});

		console;

		const transaction = new transactionModel({
			orderId: order.id,
			customerInfo: {
				firstName: user.firstName,
				lastName: user.lastName,
				gender: user.gender,
				phone: user.phone,
				email: user.email,
				enabled: user.enabled,
				addresses: user.addresses,
			},
			productInfo: cart,
			paymentInfo: {
				method: 'stripe',
				amount: amount,
				transactionId: charges.id,
			},
			shippingInfo: {
				method: 'Company shipping method',
				cost: 10,
			},
			discountInfo: 0,
		});

		await transaction.save({ session });

		await Cart.findOneAndUpdate({ owner: UserId }, { $set: { items: [] } });

		await session.commitTransaction();

		// await newOrder.save();

		// switch (payment) {
		// 	case 'stripe':

		// 		break;
		// 	// case 'paypal':
		// 	// 	const payment = {
		// 	// 		intent: 'sale',
		// 	// 		payer: {
		// 	// 			payment_method: 'paypal',
		// 	// 		},
		// 	// 		redirect_urls: {
		// 	// 			return_url: '<YOUR_RETURN_URL>',
		// 	// 			cancel_url: '<YOUR_CANCEL_URL>',
		// 	// 		},
		// 	// 		transactions: [
		// 	// 			{
		// 	// 				item_list: {
		// 	// 					items: [
		// 	// 						{
		// 	// 							name: description,
		// 	// 							price: amount,
		// 	// 							currency: 'USD',
		// 	// 							quantity: 1,
		// 	// 						},
		// 	// 					],
		// 	// 				},
		// 	// 				amount: {
		// 	// 					currency: 'USD',
		// 	// 					total: amount,
		// 	// 				},
		// 	// 				description: description,
		// 	// 			},
		// 	// 		],
		// 	// 	};

		// 	// 	// create PayPal payment
		// 	// 	paypal.payment.create(payment, (error, payment) => {
		// 	// 		if (error) {
		// 	// 			console.log(error);
		// 	// 			res.status(500).json({
		// 	// 				message: 'An error occurred while processing your payment.',
		// 	// 			});
		// 	// 		} else {
		// 	// 			// redirect to PayPal payment approval URL
		// 	// 			// const approvalUrl = payment.links.find(
		// 	// 			// 	(link) => link.rel === 'approval_url',
		// 	// 			// ).href;
		// 	// 			res.status(200).json({ messages: 'Order placed successfully' });
		// 	// 		}
		// 	// 	});

		// 	// 	break;
		// 	// default:
		// }

		res.status(200).json({
			messages: 'Order placed successfully',
			sentObject: order._id,
			charges,
			transaction,
		});
	} catch (err) {
		console.log(err);
		await session.abortTransaction();
		next(err);
	} finally {
		session.endSession();
	}
};

const getOrders = async (req, res, next) => {
	try {
		const pageSize = +req.query.pageSize || 10;
		const currentPage = +req.query.currentPage || 1;
		const orderId = req.params.id;
		const userId = req.decToken.UserId;
		if (pageSize && currentPage) {
			const Orders = await Order.find({ owner: userId })
				.select('id status')
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
	session.startTransaction();
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

/* 
			const subItem = await SubItem.findOneAndUpdate(
				{
					_id: el.item.id,
					'variants._id': el.variant._id,
					'variant.sizes._id': el.size._id,
					'variants.sizes.$.number': { $gte: el.quantity },
				},
				{
					$inc: { 'variants$[i].sizes.$[j].number': -el.quantity },
				},
				{
					arrayFilters: [{ 'i._id': el.variant._id }, { 'j._id': el.size._id }],
					new: true,
				},
			).session(session);

*/
