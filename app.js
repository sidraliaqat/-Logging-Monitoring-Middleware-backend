const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const errorLogger = require('./middleware/errorLogger');

const app = express();
app.use(express.json());


app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/users/:id', (req, res, next) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    const err = new Error('Please enter id in numbers');
    err.status = 400;
    return next(err);   
  }

  res.json({ id, name: 'Test User' });
});
app.post('/users', (req, res) => {
  res.status(201).json({ created: true, body: req.body });
});


app.get('/error', (req, res, next) => {
  try {
    throw new Error('Something went wrong on purpose');
  } catch (err) {
    next(err);
  }
});

app.get('/slow', (req, res) => {
  setTimeout(() => {
    res.json({ message: 'That took a moment' });
  }, 300);
});

app.use(errorLogger);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
