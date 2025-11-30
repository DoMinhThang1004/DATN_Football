const router = require('express').Router();
const controller = require('../controllers/addressController');

router.get('/user/:userId', controller.getAddressesByUser);
router.post('/', controller.addAddress);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);

module.exports = router;