const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/login', userController.loginUser);
router.post('/register', userController.createUser);
router.post('/forgot-password', userController.sendForgotPasswordOTP);
router.post('/reset-password', userController.resetPasswordWithOTP);
router.post('/reset-password-direct', userController.resetPasswordDirect); 

router.put('/:id', verifyToken, userController.updateUser);

router.get('/', verifyAdmin, userController.getAllUsers); 
router.post('/', verifyAdmin, userController.createUser); 
router.delete('/:id', verifyToken, userController.deleteUser); 
router.delete('/:id/permanent', verifyAdmin, userController.deleteUserPermanently); 

module.exports = router;