'use strict';
var createError = require('http-errors');

const { users } = require('../schemas/user-schema.js');

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return next(createError('No Authorization header attached', 403));
    }

    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.authenticateToken(token);

    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    return next(createError('No Authorization header attached', 403));
  }
};
