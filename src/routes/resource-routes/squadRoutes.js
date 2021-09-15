'use strict';

const express = require('express');
const { db, User } = require('../../schemas/index');
const bearerAuth = require('../../middleware/bearerauth');
const squadRouter = express.Router();
const { v4: uuidv4 } = require('uuid');
const createError = require('http-errors');

const getUserSquads = async (req, res, next) => {
  //find the user model from the request
  const user = await User.findOne({ where: { username: req.user.username } });
  //find all squads that current user belongs to
  let userSquadIds;
  try {
    let squads = await db.models.team.findAll({ where: { UserId: user.id } });

    userSquadIds = squads.map((row) => {
      return row.SquadId;
    });
  } catch (err) {
    return next(createError(403, err.message));
  }

  //find all members of those squads
  try {
    let arr = [];
    for (let x = 0; x < userSquadIds.length; x++) {
      let members = await db.models.team.findAll({
        where: { SquadId: userSquadIds[x] },
      });
      let memberIds = members.map((member) => {
        return member.UserId;
      });
      let groupMembers = [];
      for (let x = 0; x < memberIds.length; x++) {
        let user = await User.findOne({ where: { id: memberIds[x] } });
        groupMembers.push(user.username);
      }
      arr.push(groupMembers);
    }
    res.status(200).json({ squads: arr });
  } catch (err) {
    return next(createError(403, err.message));
  }
};

const createSquad = async (req, res, next) => {
  try {
    const newSquad = await db.models.Squads.create({
      name: uuidv4(),
      owner: req.user.username,
    });

    const user = await User.findOne({ where: { username: req.user.username } });
    await user.addSquads(newSquad); //sequelize magic happens here
    let squadmates = req.body.squadmates;
    squadmates.forEach(async (squadmate) => {
      const user = await User.findOne({ where: { username: squadmate } });
      await user.addSquads(newSquad); // same sequelize stuff
    });
    res.status(201).json({
      message: `Created a new squad with ${req.body.squadmates.join(
        ', '
      )} and ${req.user.username}`,
    });
  } catch (err) {
    return next(createError(403, err.message));
  }
};

const deleteSquad = async (req, res, next) => {
  let user = await User.findOne({ where: { username: req.user.username } });
  let { SquadId } = req.body;
  try {
    let squad = await user.getSquads({ where: { id: SquadId } });
    if (squad[0].owner == req.user.username) {
      await db.models.team.destroy({ where: { SquadId } });
      await db.models.Squads.destroy({ where: { id: SquadId } });
      res.status(202).json({ message: 'Deleted successfully' });
    } else {
      return next(createError(403, 'You can only delete squads that you own!'));
    }
  } catch (err) {
    return next(createError(403, err.message));
  }
};

squadRouter.get('/squads', bearerAuth, getUserSquads);

squadRouter.post('/squads', bearerAuth, createSquad);

squadRouter.delete('/squads', bearerAuth, deleteSquad);

module.exports = squadRouter;
