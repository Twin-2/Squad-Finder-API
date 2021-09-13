'use strict';

const express = require('express');
const { users } = require('../schemas/index.js');
const bearerAuth = require('../../middleware/bearerauth');
const squadRouter = express.Router();

//will have the route for getting all squads for a user
squadRouter.get('/squads', bearerAuth, (req, res, next) => {
  //get user
  //query their squads
  //return their squads
  const user = await users.findOne({ where: { username: req.user.username } });
  const squads = await user.getTeams();
  res.json(squads);
});

//will have a route for adding people to squads (create the relationship)
squadRouter.post('/squads', bearerAuth, (req, res, next) => {
  //send in multiple user IDs / usernames
  //create a squad with the requesting user and the users sent
  //return success / fail
  const friendIDs = req.body.friendIDs;
  const user = await users.findOne({ where: { username: req.user.username } });
  await user.setTeams(friendIDs);
});

// will have a route for removing/leaving a squad member or squad
squadRouter.delete('/squads', bearerAuth, (req, res, next) => {});

//consider ACL for the usser that creates the squad?

module.exports = squadRouter;
