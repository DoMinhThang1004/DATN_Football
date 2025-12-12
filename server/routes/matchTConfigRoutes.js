const router = require('express').Router();
const controller = require('../controllers/matchTConfigController');


router.get('/match/:matchId', controller.getByMatch); 
router.get('/zones/:matchId', controller.getZones); // lấy khuv
router.post('/', controller.create);           
router.delete('/:id', controller.remove);            
router.put('/:id', controller.update);        

module.exports = router;