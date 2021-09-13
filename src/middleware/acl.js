'use strict';

// const { users } = require('../schemas/index.js');

module.exports = (permission) => {
  return (req, res, next) => {
    try {
      if(req.users.permissions.includes(permission)) {
        next()
      } else {
        next('Invalid Access')
      }
    } catch (e) {
      next('Invalid Login')
    }
  }
}