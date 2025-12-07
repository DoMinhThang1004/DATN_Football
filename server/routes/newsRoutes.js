// File: server/routes/newsRoutes.js
const router = require('express').Router();
const newsController = require('../controllers/newsController');

router.get('/', newsController.getAllNews);       
router.get('/:id', newsController.getNewsById); 

//tạo
router.post('/', newsController.createNews); 

//update
router.put('/:id', newsController.updateNews); 

//xóa
router.delete('/:id', newsController.deleteNews);

module.exports = router;