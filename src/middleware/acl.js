'use strict';

// const { users } = require('../schemas/index.js');

module.exports = (capability) => {
  return (req, res, next) => {
    try {
      if(req.user.capabilities.includes(capability)) {
        console.log('capabilities')
        next()
      } else {
        next('Invalid Access')
      }
    } catch (e) {
      next('Invalid Login')
    }
  }
}