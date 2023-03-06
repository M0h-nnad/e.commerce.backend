const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controller/Order.controller');

router.get('/order', auth, controller.OrderFun.getOrders);
router.post('/order', auth, controller.OrderFun.CreateOrder);
router.delete('/order', auth, controller.OrderFun.deleteOrder);

module.exports = router;
