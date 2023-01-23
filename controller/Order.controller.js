const OrderLine = require('../models/orderLine.model');
const Order = require('../models/order.model');
const SubItem = require('../models/subItem.model');

const bwipjs = require('bwip-js');

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

		/* Creating OrderLines */

		const lineItems = [];

		req.body.orderLines.forEach(async (el) => {
			const newOrderLine = await new OrderLine(el);
			// bwipjs
			//   .toBuffer({
			//     bcid: "code128", // Barcode type
			//     text: `http://localhost:3000/order/${newOrderLine._id}`, // Text to encode
			//     scale: 3, // 3x scaling factor
			//     height: 10, // Bar height, in millimeters
			//   })
			//   .then((png) => {
			//     const buffer = new Buffer(png).toString("base64");
			//     barcode = buffer;
			//   })
			//   .catch((err) => {
			//     next(err);
			//   });
			// newOrderLine.barcode = barcode;
			// newOrderLine.barcodeText = `http://localhost:3000/order/${newOrderLine._id}`;
			await newOrderLine.save();
			await Order.updateOne(
				{ _id: newOrder._id },
				{ $addToSet: { orderLines: newOrderLine._id } },
			);

			const updatedItem = await SubItem.findByIdAndUpdate(
				{ _id: item },
				{ $inc: { 'SubItem.count': -1 } },
			);

			const line_item = {
				price_date: {
					currency: 'usd',
					product_data: {
						id: updatedItem._id,
						name: updatedItem.name,
					},
					unit_amount: updatedItem.price,
				},
				quantity: newOrderLine.quantity,
			};
			lineItems.push(line_item);
		});

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: lineItems,
			mode: 'payment',
		});

		return res
			.status(201)
			.send({ messages: 'Order Created Successfully', sentObject: session.id });
	} catch (err) {
		return next(err);
	}
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
	try {
		const Order = await Order.findeOneAndDelete({ owner: req.params.id });
		for (let line of Order.ordreLines) {
			await OrderLine.deleteOne({ _id: line });
		}
		return res.status(200).send({ messages: 'Orders Deleted Successfully' });
	} catch (err) {
		return next(err);
	}
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
