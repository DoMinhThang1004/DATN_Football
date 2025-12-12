const router = require('express').Router();
const ticketTypeController = require('../controllers/ticketTypeController');

router.get('/', ticketTypeController.getAllTicketTypes);
router.post('/', ticketTypeController.createTicketType);
router.put('/:id', ticketTypeController.updateTicketType);
router.delete('/:id', ticketTypeController.deleteTicketType);

module.exports = router;