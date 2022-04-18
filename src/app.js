const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const router = require('./routes/router');
const HttpError = require('./httpError');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(router);
/**
 * Return error codes
 */
app.use((error, req, res, next) => {
  if (error instanceof HttpError) {
    return res.status(error.code).json({
      error: error.message,
    });
  }

  console.error(error); // not okay in production, but this is test task
  res.status(500).json({
    error: 'Internal server error',
  });
});

module.exports = app;
