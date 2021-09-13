'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('./user-schema.js');
const squadModel = require('./squad-schema.js')
const achievementModel = require('./achievements-schema.js')

const DATABASE_URL = process.env.DATABASE_URL;

let sequelizeOptions = process.env.NODE_ENV === 'production' ? {
  // this is about Heroku and ensuring SSL is enabled
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
  // otherwise, we don't need any dialect options - it will default to {} standard
} : {};

const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);

const users = userModel(sequelize, DataTypes)
const squads = squadModel(sequelize, DataTypes)
const achievements = achievementModel(sequelize, DataTypes)

users.hasMany(squads, {
  onDelete: "cascade"
});
  squads.belongsTo(users);
users.hasMany(achievements, {
  onDelete: "cascade"
});
  achievements.belongsTo(users);
//friends==============
users.hasMany(users, {
  onDelete: "cascade"
});
  users.belongsTo(users)
//======================
squads.hasMany(users, {
  onDelete: "cascade"
});
  users.belongsTo(squads)


module.exports = {
  db: sequelize,
  users: users,
  squads: squads,
  achievements: achievements
}