const logger = require('../utils/logger');


function errorLogger(err, req, res, next) {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);


  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
}

module.exports = errorLogger;
