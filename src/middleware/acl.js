'use strict';

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