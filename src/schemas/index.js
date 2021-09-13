'use strict';

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
//DataTypes is greyed out on my file. Why?
const userSchema = require('./user-schema.js');
const squadSchema = require('./squad-schema.js');
const achievementsSchema = require('./achievements-schema.js');

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

const users = userSchema(sequelize, DataTypes);
const squads = squadSchema(sequelize, DataTypes);
const achievements = achievementsSchema(sequelize, DataTypes);

//define SQL relational ownership here

module.exports = {
  db: sequelize,
  users: users,
  squads: squads,
  achievements: achievements
}