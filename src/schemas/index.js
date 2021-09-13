'use strict';

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize')
const userModel = require('./user-schema.js')
const squadModel = require('./squad-schema.js')
const achievementModel = require('./achievements-schema.js')
const profileModel = require('./profile-schema.js')

const DATABASE_URL = process.env.NODE_ENV === 'test' ? 'sqlite:memory' : process.env.DATABASE_URL;

let sequelizeOptions = process.env.NODE_ENV === 'production' ? {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
} : {};

const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);

const users = userModel(sequelize, DataTypes)
const squads = squadModel(sequelize, DataTypes)
const achievements = achievementModel(sequelize, DataTypes)
const profiles = profileModel(sequelize, DataTypes)

// Creates a many-to-many relationship between users and squads
// A Squad has many Users and a User has many Squads
users.belongsToMany(squads, {
  as: 'Team',
  through: 'team',
  onDelete: 'cascade'
});
  squads.belongsTo(users);
// Creates a one-to-many relationship between profiles and achievements
// A Profile has many achievements and Achievements belong to one 
// Profile
profiles.hasMany(achievements, {
  onDelete: 'cascade'
});
  achievements.belongsTo(profiles);
// Creates a one-to-one relationship between users and profiles
// A User has one Profile and a Profile belongs to one User
users.hasOne(profiles, {
  onDelete: 'cascade'
});
  profiles.belongsTo(users)
// Cretes a many-to-many relationship between users
// A User has many Users
// This allows the creation of Friends through a junction table called
// friends
users.belongsToMany(users, { 
  as: 'Friends',
  through: 'friends'
});

users.belongsToMany(users, { 
  as: 'Requestees', 
  through: 'friendRequests', 
  foreignKey: 'requesterId', 
  onDelete: 'CASCADE'
});
users.belongsToMany(users, { 
  as: 'Requesters', 
  through: 'friendRequests', 
  foreignKey: 'requesteeId', 
  onDelete: 'CASCADE'
});

module.exports = {
  db: sequelize,
  users: users,
  squads: squads,
  achievements: achievements,
  profiles: profiles
}