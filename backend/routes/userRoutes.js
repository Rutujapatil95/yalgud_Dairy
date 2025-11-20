const express = require('express');
const router = express.Router();
const { createPin, verifyPin } = require('../controllers/userController');

router.post('/create-pin', createPin);
router.post('/verify-pin', verifyPin);

module.exports = router;
