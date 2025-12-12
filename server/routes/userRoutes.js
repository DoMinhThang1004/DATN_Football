const router = require('express').Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.delete('/:id/permanent', userController.deleteUserPermanently);
router.post('/reset-password-direct', userController.resetPasswordDirect);//quên mk

module.exports = router;