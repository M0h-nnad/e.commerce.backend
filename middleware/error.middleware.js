const errorMiddleWare = (err, req, res, next) => {
	switch (err.name) {
		case 'MongoServerError':
			if (err.code === 11000) {
				const field = Object.keys(err.keyValue);
				const code = 409;
				const error = `This Value Of ${field} Is Taken`;
				res.status(code).send({ messages: error, fields: field });
				break;
			}
		case 'CastError':
			const castError = new Error(`Invalid ${err.path}: ${err.value}`);
			return res.status(400).send({ messages: castError });
			break;
		case 'ValidationError':
			const error = Object.values(err.errors).map((el) => el.message);
			const fields = Object.values(err.errors).map((el) => el.path);
			const code = 400;

			if (error.length > 1) {
				const formattedErrors = error.join(' ');
				return res.status(code).send({ messages: formattedErrors, fields: fields });
			} else {
				return res.status(code).send({ messages: error, fields: fields });
			}
			break;
		case 'NotFound':
			return res.status(400).send({ message: err });
			break;
		default:
			console.log(err);
			res.status(500).send({ messages: 'An Unknown Error Occurred' });
	}
};

module.exports = errorMiddleWare;
