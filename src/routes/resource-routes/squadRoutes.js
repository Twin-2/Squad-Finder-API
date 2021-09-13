'use strict';

const express = require('express');
const { db, User } = require('../../schemas/index');
const bearerAuth = require('../../middleware/bearerauth');
const squadRouter = express.Router();
const { v4: uuidv4 } = require('uuid');

//will have the route for getting all squads for a user
squadRouter.get('/squads', bearerAuth, async (req, res, next) => {
  const user = await User.findOne({ where: { username: req.user.username } });
  const squads = await user.getSquads();
  const team = await db.models.team.findAll({
    where: { SquadId: squads[0].id },
  });
  res.json(team);
});

//will have a route for adding people to squads (create the relationship)
squadRouter.post('/squads', bearerAuth, async (req, res, next) => {
  //create a squad with the requesting user and the users sent
  //return success / fail
  try {
    const newSquad = await db.models.Squads.create({
      name: uuidv4(),
      owner: req.user.username,
    });

    const user = await User.findOne({ where: { username: req.user.username } });
    await user.setSquads(newSquad);
    //req.squadmates = ["jeff", "brian", "your-mom"];
    let squadmates = req.body.squadmates;
    squadmates.forEach(async (squadmate) => {
      const user = await User.findOne({ where: { username: squadmate } });
      console.log(user);
      await user.setSquads(newSquad);
    });
    res.status(201).json({ message: 'squad created' });
  } catch (err) {
    return next(err);
  }
});

// will have a route for removing/leaving a squad member or squad
squadRouter.delete('/squads', bearerAuth, (req, res, next) => {});

//consider ACL for the usser that creates the squad?

module.exports = squadRouter;
