const mongoose = require('mongoose');
const { MONGOURI } = process.env;
mongoose
	.connect(MONGOURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		ignoreUndefined: true,
		dbName:'ecommerce'
	})
	.then(() => {
		console.log('connected to db');
	})
	.catch((E) => {
		console.log(E);
	});
const conn = mongoose.connection;

mongoose.Promise = global.Promise;


mongoose.set('strict', true);
mongoose.set('toJSON', {
	getters: true,
	virtuals: true,
	id: true,
	transform: (doc, ret) => {
		delete ret._id;
		if (ret.password) delete ret.password;
		if (ret.userId) delete ret.userId;
		return ret;
	},
});
mongoose.set('toObject', {
	getters: true,
	virtuals: true,
	id: true,
	transform: (doc, ret) => {
		delete ret._id;
		return ret;
	},
});


module.exports = conn;
