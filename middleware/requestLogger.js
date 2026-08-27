const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const elapsedNs = process.hrtime.bigint() - startedAt;
    const durationMs = Number(elapsedNs) / 1e6;

    logger.request({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: durationMs.toFixed(2),
    });
  });

  next();
}

module.exports = requestLogger;
