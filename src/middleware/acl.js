'use strict';

const createError = require('http-errors');

module.exports = (capability) => {
  return (req, res, next) => {
    try {
      if(req.user.capabilities.includes(capability)) {
        console.log(req.user.capabilities);
        next()
      } else {
        next(createError(403, "Permission denied. You do not have access to perform this action."));
      }
    } catch (e) {
      next('Invalid Login')
    }
  }
}