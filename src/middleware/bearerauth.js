'use strict';
var createError = require('http-errors');
const { users } = require('../schemas/index.js');

module.exports = async (req, res, next) => {
  try {
    console.log('here')
    if (!req.headers.authorization) {
      return next(createError('No Authorization header attached', 403));
    }
    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.authenticateToken(token);
    console.log('here2')
    req.user = validUser;
    req.token = validUser.token;
    console.log('here3')
    next();
  } catch (e) {
    return next(createError('No Authorization header attached', 403));
  }
};
