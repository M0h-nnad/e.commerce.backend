class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = 'NotFound';
	}
}

class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'CustomValidationError';
	}
}

module.exports = { NotFoundError, ValidationError };
