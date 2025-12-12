const router = require('express').Router();
const controller = require('../controllers/paymentController');


router.post('/create_payment_url', controller.createPaymentUrl);
router.get('/vnpay_return', controller.vnpayReturn);
router.get('/vnpay_ipn', controller.vnpayIPN);

router.post('/create_momo_url', controller.createMomoPaymentUrl);
router.get('/momo_return', controller.momoReturn);
router.post('/momo_ipn', controller.momoIPN);

module.exports = router;