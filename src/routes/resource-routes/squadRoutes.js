'use strict';

const express = require('express');
const { db, User } = require('../../schemas/index');
const bearerAuth = require('../../middleware/bearerauth');
const squadRouter = express.Router();
const { v4: uuidv4 } = require('uuid');
const createError = require('http-errors');

squadRouter.get('/squads', bearerAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    const squads = await user.getSquads();
    const team = await db.models.team.findAll({
      where: { SquadId: squads[0].id },
    });
    res.status(200).json(team);
  } catch (err) {
    return next(createError(403, err.message));
  }
});

squadRouter.post('/squads', bearerAuth, async (req, res, next) => {
  try {
    const newSquad = await db.models.Squads.create({
      name: uuidv4(),
      owner: req.user.username,
    });

    const user = await User.findOne({ where: { username: req.user.username } });
    await user.addSquads(newSquad);
    let squadmates = req.body.squadmates;
    squadmates.forEach(async (squadmate) => {
      const user = await User.findOne({ where: { username: squadmate } });
      console.log(user);
      await user.addSquads(newSquad);
    });
    res.status(201).json({ message: 'squad created' });
  } catch (err) {
    return next(createError(403, err.message));
  }
});

squadRouter.delete('/squads', bearerAuth, async (req, res, next) => {
  let user = await User.findOne({ where: { username: req.user.username } });
  let { SquadId } = req.body;
  try {
    let squad = await user.getSquads({ where: { id: SquadId } });
    if (squad[0].owner == req.user.username) {
      await db.models.team.destroy({ where: { SquadId } });
      res.status(202).json({ message: 'Deleted successfully' });
    } else {
      return next(createError(403, 'You can only delete squads that you own!'));
    }
  } catch (err) {
    return next(createError(403, err.message));
  }
});

module.exports = squadRouter;
//
