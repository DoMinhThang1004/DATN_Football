const router = require('express').Router();
const controller = require('../controllers/oderController');

router.post('/', controller.createOrder);
router.get('/', controller.getAllOrders);
router.get('/:id', controller.getOrderById);
router.put('/:id', controller.updateOrderStatus);

module.exports = router;