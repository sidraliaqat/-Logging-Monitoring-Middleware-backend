const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const stream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

stream.on('error', (err) => {
  console.error('[logger] failed to write to log file:', err.message);
});

function writeLine(line) {
  stream.write(line + '\n');
}

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info(message) {
    writeLine(`[${timestamp()}] [INFO] ${message}`);
  },

  error(message, err) {
    let line = `[${timestamp()}] [ERROR] ${message}`;
    if (err && err.stack) {
      line += `\n${err.stack}`;
    } else if (err) {
      line += `\n${String(err)}`;
    }
    writeLine(line);
  },


  request({ method, path: reqPath, statusCode, durationMs }) {
    writeLine(
      `[${timestamp()}] [REQUEST] ${method} ${reqPath} ${statusCode} ${durationMs}ms`
    );
  },
};

module.exports = logger;
