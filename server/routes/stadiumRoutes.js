const router = require('express').Router();
const stadiumController = require('../controllers/stadiumController');


//get /api/stadiums
router.get('/', stadiumController.getAllStadiums);

//post /api/stadiums
router.post('/', stadiumController.createStadium);

//put /api/stadiums/:id
router.put('/:id', stadiumController.updateStadium);

//delete /api/stadiums/:id
router.delete('/:id', stadiumController.deleteStadium);

module.exports = router;