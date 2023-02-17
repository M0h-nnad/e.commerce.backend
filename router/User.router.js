const UserController = require('../controller/User.contoller');
const verfiyToken = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// User

router.post('/login', UserController.User.logIn);
router.post('/signup', UserController.User.signUp);

router.put('/updatePassword', verfiyToken, UserController.User.UpdatePassword);
router.put('/user', verfiyToken, UserController.User.UpdateUser);
router.delete('/user', verfiyToken, UserController.User.DeleteUser);
// Addressess

router.get('/address', verfiyToken, UserController.Address.GetUsersAddress);
router.post('/address', verfiyToken, UserController.Address.CreateAddress);
router.put('/address/:id', verfiyToken, UserController.Address.UpdateAddress);
router.delete('/address/:id', verfiyToken, UserController.Address.DeleteAddress);
// Cards

router.get('/cards', verfiyToken, UserController.Cards.getUserCards);
router.post('/cards', verfiyToken, UserController.Cards.createCards);

// favourite
router.post('/favorite/:id', verfiyToken, UserController.Favourite.addToFavourite);
router.delete('/favorite/:id', verfiyToken, UserController.Favourite.deleteFromFavourite);

// cart

router.post('/cart/:id', verfiyToken, UserController.Cart.addToCart);
router.delete('/cart/:id', verfiyToken, UserController.Cart.deleteFromCart);

module.exports = router;
