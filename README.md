# Logging & Monitoring Middleware

## Structure

```
.
├── app.js                       # Example Express app wiring everything together
├── middleware/
│   ├── requestLogger.js         # Logs method, path, status, duration for every request
│   └── errorLogger.js           # Logs stack traces on failures (4-arg error middleware)
├── utils/
│   └── logger.js                # Standalone logger utility — the only thing that touches the file
├── logs/
│   └── app.log                  # Created automatically on first run
└── postman_collection.json      # Import into Postman to test all routes
```

## How it meets the requirements

- **Method + path + duration**: `requestLogger` listens for the response's `finish` event
  and logs `method`, `originalUrl`, `statusCode`, and elapsed time (via `process.hrtime.bigint()`,
  which is more precise than `Date.now()` for short requests).
- **Error stack traces**: `errorLogger` is a standard 4-arg Express error handler registered
  last, so any `next(err)` call (or thrown error in an async handler wrapped appropriately)
  gets its full `err.stack` written to the log.
- **Separate logger utility**: `utils/logger.js` owns the only file handle. Middleware never
  touches `fs` directly — it just calls `logger.request(...)` / `logger.error(...)`.
- **Non-blocking, no memory leak**: `logger.js` opens **one** `fs.createWriteStream` in append
  mode when the module loads, and reuses it for the process lifetime. Every log call does a
  simple `stream.write(line)` — this is async/non-blocking, and there's no in-memory array of
  logs that grows over time. Node's stream internals handle buffering/backpressure, so nothing
  in application code accumulates.

## Run it

```bash
npm install
npm start
```

Server starts on `http://localhost:3000`. Logs will appear in `logs/app.log`.

## Test with Postman

1. Open Postman → **Import** → select `postman_collection.json` from this folder.
2. With the server running, send each request in the collection:
   - `GET /` → 200
   - `GET /users/:id` → 200
   - `POST /users` → 201, echoes the JSON body back
   - `GET /error` → 500, and writes a full stack trace to `logs/app.log`
   - `GET /slow` → 200 after a ~300ms delay (good for seeing duration logging clearly)
   - `GET /does-not-exist` → 404
3. After sending a few requests, tail the log file to watch entries land in real time:
   ```bash
   tail -f logs/app.log
   ```

Example log output:
```
[2026-08-25T06:49:12.297Z] [REQUEST] GET / 200 8.70ms
[2026-08-25T06:49:12.316Z] [REQUEST] POST /users 201 0.81ms
[2026-08-25T06:49:12.323Z] [ERROR] Unhandled error on GET /error
Error: Something went wrong on purpose
    at /app.js:26:11
    at Layer.handle [as handle_request] (.../express/lib/router/layer.js:95:5)
    ...
[2026-08-25T06:49:12.323Z] [REQUEST] GET /error 500 0.90ms
```

## Wiring this into your own app

```js
const requestLogger = require('./middleware/requestLogger');
const errorLogger = require('./middleware/errorLogger');

app.use(requestLogger);   // register first, before routes
// ...your routes...
app.use(errorLogger);     // register last, after routes
```
