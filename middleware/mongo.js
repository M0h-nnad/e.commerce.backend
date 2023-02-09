const mongoose = require('mongoose');
const { MONGOURI } = process.env;
mongoose
	.connect(MONGOURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		ignoreUndefined: true,
	})
	.then(() => {
		console.log('connected to db');
	})
	.catch((E) => {
		console.log(E);
	});
const conn = mongoose.connection;

mongoose.set('strict', true);
mongoose.set('toJSON', {
	getters: true,
	virtuals: true,
	id: true,
	versionKey: false,
	transform: (doc, ret) => {
		delete ret._id;
		return ret;
	},
});
mongoose.set('toObject', {
	getters: true,
	virtuals: true,
	id: true,
	versionKey: false,
	transform: (doc, ret) => {
		delete ret._id;
		return ret;
	},
});

module.exports = conn;
