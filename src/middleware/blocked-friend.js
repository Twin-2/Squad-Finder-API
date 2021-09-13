'use strict';

const Profile = require('../schemas/profile-schema.js');

module.exports = (friendId) => {
  return (req, res, next) => {
    try {
      let id = req.user.id;
      let record = await Profile.findOne({ where: { UserId: id } });
      if(!record.blockedUsers.includes(friendId)) {
        next();
      } else {
        next(createError(403, 'Permission Denied.'));
      }
    } catch (e) {
      next(createError(500, 'Error. Something went wrong.'))
    }
  }
}