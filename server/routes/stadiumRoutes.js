const router = require('express').Router();
const stadiumController = require('../controllers/stadiumController');



router.get('/', stadiumController.getAllStadiums);
router.post('/', stadiumController.createStadium);
router.put('/:id', stadiumController.updateStadium);
router.delete('/:id', stadiumController.deleteStadium);

module.exports = router;