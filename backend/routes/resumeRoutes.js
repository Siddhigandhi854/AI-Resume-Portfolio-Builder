const express = require('express');
const { generateResume, analyzeResume } = require('../controllers/resume.controller');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/generate', generateResume);
router.post('/analyze', upload.single('resume'), analyzeResume);

module.exports = router;

