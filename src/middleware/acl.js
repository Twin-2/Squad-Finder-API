'use strict';

// const { users } = require('../schemas/index.js');

module.exports = (capability) => {
  return (req, res, next) => {
    try {
      if(req.users.capabilities.includes(capability)) {
        next()
      } else {
        next('Invalid Access')
      }
    } catch (e) {
      next('Invalid Login')
    }
  }
}