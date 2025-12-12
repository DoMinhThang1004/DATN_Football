const router = require('express').Router();
const controller = require('../controllers/oderController');

router.post('/', controller.createOrder);
router.get('/', controller.getAllOrders);
router.get('/:id', controller.getOrderById);
router.put('/:id', controller.updateOrderStatus);

//thao tác user
router.get('/user/:userId', controller.getOrdersByUser);
router.put('/cancel/:id', controller.cancelOrder);

module.exports = router;