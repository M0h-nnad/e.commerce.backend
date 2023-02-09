const mongoose = require('mongoose');

const CartSubItem = new mongoose.Schema({});

const CartShema = new mongoose.Schema({
	items: { type: [mongoose.Schema.Types.ObjectId], required: true, ref: 'OrderLine' },
	owner: { type: mongoose.Schema.Types.ObjectId },
});

module.exports = mongoose.model('Cart', CartShema);
