const express = require('express');
const { generatePortfolio } = require('../controllers/portfolio.controller');

const router = express.Router();

router.post('/generate', generatePortfolio);

module.exports = router;

