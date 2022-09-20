const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controller/Order.controller');

router.post('order', auth, controller.OrderFun.CreateOrder);
router.get('order', auth, controller.OrderFun.getOrders);
router.delete('order', auth, controller.OrderFun.deleteOrder);
