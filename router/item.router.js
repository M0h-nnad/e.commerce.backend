const multer = require('multer');
const router = require('express').Router();
const controller = require('../controller/items.controller');
const auth = require('../middleware/auth');
const storage = require('../middleware/multer');
const upload = multer({ storage });
// const MIME_TYPE_MAP = {
// 	'image/png': 'png',
// 	'image/jpeg': 'jpeg',
// 	'image/jpg': 'jpg',
// };

// const upload = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		const isValid = MIME_TYPE_MAP[file.mimetype];
// 		let error = new Error('Invalid mime type;');
// 		if (isValid) error = null;
// 		cb(error, '../images');
// 	},
// 	filename: (req, file, cb) => {
// 		const name = file.originalname.toLowerCase().split(' ').join('-');
// 		const ext = MIME_TYPE_MAP[file.mimetype];
// 		cb(null, name + '-' + new Date().toDateString() + '.' + ext);
// 	},
// });

router.get('/item/:id', controller.items.GetItem);
router.get('/subitems', controller.SubItems.GetSubItems);
router.get('/subitems/:id', controller.SubItems.GetSubItem);
router.get('/category/:id', controller.category.getCategories);
router.get('/subcategory/:id', controller.subCategories.getSubCategory);
router.get('/subcategorysub/:id', controller.subCategorySub.getSubCategorySub);

router.delete('/item/:id', auth, controller.items.DeleteItem);
router.delete('/subitems/:id', auth, controller.SubItems.DeleteSubItem);
router.delete('/category/:id', auth, controller.category.DeleteCategory);
router.delete('/subcategory/:id', auth, controller.subCategories.DeleteSubCategory);
router.delete('/subcategorysub/:id', auth, controller.subCategorySub.DeleteSubCategorySub);
// router.delete('comments', auth, controller.comments.deleteComment);

router.put('/item/:id', auth, upload.single('cover'), controller.items.UpdateItem);
router.put(
	'/subitems/:id',
	auth,
	upload.fields([
		{ name: 'cover', maxCount: 1 },
		{ name: 'images', maxCount: 10 },
	]),
	controller.SubItems.updateSubItem,
);
router.put('/category/:id', auth, controller.category.updateCategory);
router.put('/subcategory/:id', auth, controller.subCategories.UpdateSubCategory);
router.put('/subcategorysub/:id', auth, controller.subCategorySub.UpdateSubCategorySub);
// router.put('/comments', auth, controller.comments.updateComments);

router.post('/item', auth, upload.single('cover'), controller.items.createItem);
router.post(
	'/subitems',
	upload.fields([
		{ name: 'cover', maxCount: 1 },
		{ name: 'images', maxCount: 8 },
	]),
	auth,
	controller.SubItems.createSubItem,
);
router.post('/category', auth, controller.category.createCategory);
// router.post('/comments', auth, controller.comments.CreateComment);
router.post('/subcategory', auth, controller.subCategories.CreateSubCategory);
router.post('/subcategorysub', auth, controller.subCategorySub.CreateSubCategorySub);
// router.post('/favourite/:id', auth, controller.favourite.addToFavourite);
router.post('/item/:id/rating', controller.rating.createRate);

module.exports = router;
