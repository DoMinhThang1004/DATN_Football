const router = require('express').Router();
const userController = require('../controllers/userController');


router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;