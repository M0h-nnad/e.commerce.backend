const errorMiddleWare = (err, req, res, next) => {
	if (err.name === 'CastError') {
		const castError = new Error(`Invalid ${err.path}: ${err.value}`);
		return res.status(400).send({ messages: castError });
	} else if (err.name === 'ValidationError') {
		const error = Object.values(err.errors).map((el) => el.message);
		const fields = Object.values(err.errors).map((el) => el.path);
		const code = 400;

		if (error.length > 1) {
			const formattedErrors = error.join(' ');
			return res.status(code).send({ messages: formattedErrors, fields: fields });
		} else {
			return res.status(code).send({ messages: error, fields: fields });
		}
	} else if (err.name === 'CustomValidationError') {
		res.status(400).send({ messages: err.message });
	} else if (err.name === 'NotFound') {
		return res.status(400).send({ messages: err.message });
	} else if (err.name === 'MongoServerError') {
		console.log(err);
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue);
			const code = 409;
			const error = `This Value Of ${field} Is Taken`;
			res.status(code).send({ messages: error, fields: field });
		}
	} else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		// Handle JSON parse error
		res.status(400).send({ message: 'Invalid JSON data' });
	} else if (err instanceof TypeError) {
		// Handle type error
		res.status(400).send({ message: 'Invalid data type' });
	} else if (err instanceof RangeError) {
		// Handle range error
		res.status(400).send({ message: 'Invalid data range' });
	} else if (err instanceof ReferenceError) {
		// Handle reference error
		res.status(500).send({ message: 'Internal server error' });
	} else if (err instanceof Error && err.name === 'ValidationError') {
		// Handle validation error
		res.status(400).send({ message: err.message });
	} else {
		res.status(500).send({ messages: 'An Unknown Error Occurred' });
	}
};

module.exports = errorMiddleWare;
