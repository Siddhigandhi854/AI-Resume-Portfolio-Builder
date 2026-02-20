const pkg = require('../package.json');

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AI Resume & Portfolio Builder API',
    version: pkg.version,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};

