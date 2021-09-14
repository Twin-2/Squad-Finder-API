'use strict';

const { Users } = require('./index.js');

const profileModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Profiles', {
    bio: { type: DataTypes.STRING, required: true },
    games: { type: DataTypes.ENUM('Madden', 'Fortnite', 'Minecraft', 'League of Legends'), required: true, defaultValue: 'Minecraft' },
    blockedUsers: { type: DataTypes.ARRAY(DataTypes.STRING) }
  });

  model.blockUser = async (req, res, next) => {
    if (!req.params.id) {
      return next(new HttpError('Error with request.', 400))
    }
    let userid = req.user.id;
    let friendId = req.params.id;
    let record = await Users.findOne({ where: { id: friendId } });
    if ((req.user.role === 'admin') || (record.UserId === userid)) {
      try {
        let deleted = await record.destroy({ where: { friendId } })
        //how to retrieve username from req object
        res.status(202).send(`${deleted.username} was blocked.`)
      } catch (e) {
        return next(new HttpError('Error. Could not block friend.', 404))
      }
    }
    if (record.UserId !== userid) {
      return next(new HttpError('Invalid permissions.', 403))
    }
    this.update(
      { 'blockedUsers': sequelize.fn('array_append', sequelize.col('blockedUsers'), friendId) }
    );
  }
  return model
}

module.exports = profileModel;
