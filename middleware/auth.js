const jwt = require('jsonwebtoken');
const config = process.env;

const verfiyToken = async (req, res, next) => {
	let token =
		req.body.token ||
		req.query.token ||
		req.headers['x-access-token'] ||
		req.headers.authorization;

	if (!token) return res.status(401).send({ messages: 'Please Login First' });
	try {
		token = token.split(' ')[1];
		const decoded = await jwt.verify(token, config.Secret);
		req.user = decoded;
		req.decToken = await jwt.decode(token);
	} catch (err) {
		return res.status(401).send({ messages: 'Invalid Token' });
	}

	return next();
};

module.exports = verfiyToken;
