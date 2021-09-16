'use strict';

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('./user-schema.js');
const squadModel = require('./squad-schema.js');
const achievementModel = require('./achievements-schema.js');
const profileModel = require('./profile-schema.js');

const DATABASE_URL =
  process.env.NODE_ENV === 'test' ? 'sqlite:memory' : process.env.DATABASE_URL;

let sequelizeOptions =
  process.env.NODE_ENV === 'production'
    ? {
        dialect: 'postgres',
        host: process.env.RDS_HOSTNAME,
        username: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT,
      }
    : {};

const sequelize =
  process.env.NODE_ENV === 'production'
    ? new Sequelize(sequelizeOptions)
    : new Sequelize(DATABASE_URL);

const User = userModel(sequelize, DataTypes);
const Squad = squadModel(sequelize, DataTypes);
const Achievement = achievementModel(sequelize, DataTypes);
const Profile = profileModel(sequelize, DataTypes);

User.belongsToMany(Squad, {
  through: 'team',
  onDelete: 'cascade',
});

Squad.belongsToMany(User, {
  through: 'team',
  onDelete: 'cascade',
});

Profile.hasMany(Achievement, {
  onDelete: 'cascade',
});

Achievement.belongsTo(Profile);

User.hasOne(Profile, {
  onDelete: 'cascade',
});

Profile.belongsTo(User);

User.belongsToMany(User, {
  as: 'Friends',
  through: 'friends',
});

User.belongsToMany(User, {
  as: 'BlockedUsers',
  through: 'blockedusers',
});

User.belongsToMany(User, {
  as: 'Requestees',
  through: 'friendRequests',
  foreignKey: 'requesterId',
  onDelete: 'CASCADE',
});
User.belongsToMany(User, {
  as: 'Requesters',
  through: 'friendRequests',
  foreignKey: 'requesteeId',
  onDelete: 'CASCADE',
});

module.exports = {
  db: sequelize,
  User: User,
  Profile: Profile,
  Squad: Squad,
  Achievement: Achievement,
};
