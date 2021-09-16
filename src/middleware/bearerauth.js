'use strict';
const createError = require('http-errors');
const { User } = require('../schemas/index');

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return next(createError(403, 'Authentication Error'));
    }
    const token = req.headers.authorization.split(' ').pop();
    const validUser = await User.authenticateToken(token);

    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    return next(createError(403, 'Authentication Error'));
  }
};
