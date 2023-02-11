class NotFoundError extends Error {
	constructor(message) {
		super(message);
		this.name = 'NotFound';
	}
}

module.exports = NotFoundError;
