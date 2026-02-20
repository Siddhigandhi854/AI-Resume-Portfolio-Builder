const express = require('express');
const { generateCoverLetter } = require('../controllers/coverLetter.controller');

const router = express.Router();

router.post('/generate', generateCoverLetter);

module.exports = router;

