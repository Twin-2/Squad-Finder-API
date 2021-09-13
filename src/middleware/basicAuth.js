'use strict';
var createError = require('http-errors');

const base64 = require('base-64');
const { users } = require('../schemas/index.js');

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(createError('No such user', 403));
  }

  let basic = req.headers.authorization.split(' ').pop();
  let [user, pass] = base64.decode(basic).split(':');

  try {
    req.user = await users.model.authenticateBasic(user, pass);
    next();
  } catch (e) {
    return next(createError('No such user', 403));
  }
};
