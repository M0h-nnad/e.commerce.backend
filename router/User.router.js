const UserController = require('../controller/User.contoller');
const verfiyToken = require('../middleware/auth');
const express = require('express');
const router = express.Router();


// User

router.post('/login',UserController.User.logIn);
router.post('/signup', UserController.User.signUp);

// Addressess 

router.post('/address',verfiyToken,UserController.Address.CreateAddress);

// Cards 

router.get('/Cards',verfiyToken,UserController.Cards.getUserCards)
router.post('/Cards',verfiyToken,UserController.Cards.createCards)

module.exports = router;