const express = require('express');
const router = express.Router();
const supabaseController = require('../controllers/supabase');
const alteredController = require('../controllers/altered');
const multer  = require('multer')
const storage = multer.memoryStorage(); // Store file in memory as Buffer
//const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage: storage });

router.get('/user/admin', supabaseController.g_isAdmin);

router.post('/deck/new', supabaseController.g_newDeck);
router.post('/deck/update', supabaseController.g_updateDeck);
router.post('/deck/updatealtered/:id', supabaseController.g_updateDeckFromAltered);
router.post('/deck/saveprops', supabaseController.g_saveProperties);
router.post('/deck/save', supabaseController.g_saveDeck);
router.post('/deck/newversion', supabaseController.g_createDeckVersion);
router.post('/deck/deleteversion', supabaseController.g_deleteDeckVersion);
router.get('/deck/getfromapi/:id', alteredController.g_getDeckFromApi);
router.get('/deck/favori/:id', supabaseController.g_toggleDeckFavori);

router.get('/deck/delete/:id', supabaseController.g_deleteDeck);

//update du chemin S3 en base
router.post('/image/s3', supabaseController.g_updateImageS3);
//upload du fichier webp sur le storage
router.post('/image/s3/upload', upload.single('fichier'), supabaseController.g_uploadImage);

router.post('/card/update', supabaseController.g_updateCard);
router.post('/card/getfromapi/:ref', alteredController.g_getCardFromApi);
router.get('/card/favori/:ref', supabaseController.g_toggleCardFavori);
router.get('/card/addfavori/:ref', supabaseController.g_addCardFavori);

router.post('/cards/getfromapi', alteredController.g_getCardsFromApi);
router.post('/cards/stats', alteredController.g_getCardsStats);
router.post('/cards/collection/update', supabaseController.g_updateCollection);

router.post('/cardsdeck/set', supabaseController.g_setCardsDeck);

router.post('/tournoi/save', supabaseController.g_saveTournoi);

router.get('/tools/previewarticle', alteredController.g_getPreviewArticle);

module.exports = router;