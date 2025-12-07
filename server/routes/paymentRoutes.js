const router = require('express').Router();
const controller = require('../controllers/paymentController');

//vnpay
//tạo link tt
router.post('/create_payment_url', controller.createPaymentUrl);

//xử lý kq
router.get('/vnpay_return', controller.vnpayReturn);

//ipn vnpay gọi
router.get('/vnpay_ipn', controller.vnpayIPN);

//momo
//tạo link tt
router.post('/create_momo_url', controller.createMomoPaymentUrl);

//xử lý kq
router.get('/momo_return', controller.momoReturn);

//ipn momo gọi
router.post('/momo_ipn', controller.momoIPN);

module.exports = router;