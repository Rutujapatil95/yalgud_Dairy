const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getOffers, addOffer } = require('../controllers/offerController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get('/', getOffers);
router.post('/', upload.single('image'), addOffer);

module.exports = router;
