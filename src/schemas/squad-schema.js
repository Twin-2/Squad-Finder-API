'use strict';

const squadModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Squads', {
    name: { type: DataTypes.STRING, required: true, unique: true },
  });

  return model;
}

module.exports = squadModel;