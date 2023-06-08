const router = require('express').Router();
const controller = require('./controller');
const multer = require('multer');

const upload = multer({ dest: "uploads/"});


router.post('/api/register', controller.postRegister);
router.post('/api/login', controller.postLogin);
router.post('/api/ocr', upload.single('my-file'), controller.postOCR)
router.get('/api/getPreviousDocuments/:email', controller.getPreviousDocuments);
router.post('/api/addPreviousDocument', controller.addPreviousDocument);


module.exports = router;