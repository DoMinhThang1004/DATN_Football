const router = require('express').Router();
const controller = require('../controllers/ticketController');

router.get('/user/:userId', controller.getMyTickets);
router.get('/occupied/:configId', controller.getOccupiedSeats);
router.get('/:id', controller.getTicketDetail);

module.exports = router;