'use strict';

async function handleErrors(err, req, res, next) {
  if (res.headersSent) {
    return;
  }
  const message = err.message || 'Server error';
  const status = err.status || 500;

  res.status(status).json({ message: message });
}

module.exports = handleErrors;
