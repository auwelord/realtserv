const express = require('express');
const router = express.Router();
const supabaseController = require('../controllers/supabase');
const multer  = require('multer')
const storage = multer.memoryStorage(); // Store file in memory as Buffer
//const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage: storage });

router.get('/user/admin/:id', supabaseController.g_isAdmin);

router.post('/deck/new', supabaseController.g_newDeck);
router.post('/deck/update', supabaseController.g_updateDeck);
router.post('/deck/saveprops', supabaseController.g_saveProperties);
router.post('/deck/save', supabaseController.g_saveDeck);
router.get('/deck/delete/:id', supabaseController.g_deleteDeck);


//update du chemin S3 en base
router.post('/image/s3', supabaseController.g_updateImageS3);
//upload du fichier webp sur le storage
router.post('/image/s3/upload', upload.single('fichier'), supabaseController.g_uploadImage);

router.post('/card/update', supabaseController.g_updateCard);
router.get('/card/getfromapi/:ref', supabaseController.g_getCardFromApi);

router.post('/cardsdeck/set', supabaseController.g_setCardsDeck);

module.exports = router;