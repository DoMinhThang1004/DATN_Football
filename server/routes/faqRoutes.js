const router = require('express').Router();
const faqController = require('../controllers/faqController');

router.get('/', faqController.getFaqs);

module.exports = router;