const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next(); // Ensure next is always called to move to the next middleware
};

module.exports = credentials;