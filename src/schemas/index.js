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
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {};

const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);

const User = userModel(sequelize, DataTypes);
const Squad = squadModel(sequelize, DataTypes);
const Achievement = achievementModel(sequelize, DataTypes);
const Profile = profileModel(sequelize, DataTypes);

// Creates a many-to-many relationship between User and squads
// A Squad has many User and a User has many Squads
User.belongsToMany(Squad, {
  through: 'team',
  onDelete: 'cascade',
});

Squad.belongsTo(User);
// Creates a one-to-many relationship between Profile and Achievement
// A Profile has many Achievement and Achievement belong to one

// Profile

Profile.hasMany(Achievement, {
  onDelete: 'cascade',
});

Achievement.belongsTo(Profile);
// Creates a one-to-one relationship between User and Profile

// A User has one Profile and a Profile belongs to one User
User.hasOne(Profile, {
  onDelete: 'cascade',
});

Profile.belongsTo(User);
// Cretes a many-to-many relationship between User
// A User has many User
// This allows the creation of Friends through a junction table called
// friends
User.belongsToMany(User, {
  as: 'Friends',
  through: 'friends',
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
