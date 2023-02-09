const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(process.cwd(), '../images'));
	},
	filename: (req, file, cb) => {
		const name = file.originalname.toLowerCase().split(' ').join('-');
		cb(null, name + '.' + '-' + new Date().toDateString().replace(/:/g, '-'));
	},
});

module.exports = storage;
