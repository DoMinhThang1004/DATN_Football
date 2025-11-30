const router = require('express').Router();
const matchController = require('../controllers/matchController');

// CRUD Routes
router.get('/', matchController.getAllMatches);
router.post('/', matchController.createMatch);
router.put('/:id', matchController.updateMatch);
router.delete('/:id', matchController.deleteMatch);

// Route lấy chi tiết (MỚI) - QUAN TRỌNG
router.get('/:id', matchController.getMatchById);

module.exports = router;