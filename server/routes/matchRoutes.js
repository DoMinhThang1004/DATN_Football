const router = require('express').Router();
const matchController = require('../controllers/matchController');

router.get('/', matchController.getAllMatches);
router.post('/', matchController.createMatch);
router.put('/:id', matchController.updateMatch);
router.delete('/:id', matchController.deleteMatch);

//lấy trd : id
router.get('/:id', matchController.getMatchById);

module.exports = router;