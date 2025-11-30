const router = require('express').Router();
const controller = require('../controllers/dashboardController');

router.get('/stats', controller.getStats);

module.exports = router;