const router = require('express').Router();
const controller = require('../controllers/commentController');

router.get('/match/:matchId', controller.getCommentsByMatch); //lấy ds cmt trd
router.post('/', controller.createComment); //post cmt

//admin
router.get('/all', controller.getAllComments);
router.put('/:id', controller.updateComment);  //ad tl
router.delete('/:id', controller.deleteComment); //xóa

module.exports = router;