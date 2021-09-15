'use strict';

const express = require('express');
const profileRouter = express.Router();
const bearerAuth = require('../../middleware/bearerauth.js');
const { User, Profile } = require('../../schemas/index.js');
var createError = require('http-errors');

const acl = require('../../middleware/acl.js');

const handleCreate = async (req, res, next) => {
  try {
    let userid = req.user.id;
    let { bio, game } = req.body;
    let record = await Profile.create({ bio, game, UserId: userid });
    res.status(201).send(record);
  } catch (e) {
    return next(createError(500, 'Something went wrong'));
  }
};

const handleGetOne = async (req, res, next) => {
  try {
    let id = req.user.id;
    let record = await Profile.findOne({ where: { UserId: id } });
    res.status(200).send(record);
  } catch (e) {
    return next(createError(404, 'Could not find that profile'));
  }
};

const handleUpdateOne = async (req, res, next) => {
  let userid = req.user.id;
  let id = req.params.id;
  let record = await Profile.findOne({ where: { UserId: userid } });
  if (req.user.role === 'admin' || record.UserId === userid) {
    try {
      let obj = req.body;
      let updated = await Profile.update(obj, { where: { UserId: userid } });
      res.status(202).send(updated);
    } catch (e) {
      return next(createError(404, 'Could not find that note'));
    }
  }
};

const handleDeleteOne = async (req, res, next) => {
  let userid = req.user.id;
  let id = req.params.id;
  let record = await Profile.findOne({ where: { UserId: userid } });
  if (req.user.role === 'admin') {
    try {
      let deleted = await Profile.destroy({ where: { UserId: userid } });
      res.status(202).send('profile was deleted');
    } catch (e) {
      return next(createError(404, 'Could not find that profile'));
    }
  }
};

profileRouter.post('/profile', bearerAuth, acl('create'), handleCreate);
profileRouter.get('/profile', bearerAuth, acl('read'), handleGetOne);
profileRouter.put('/profile', bearerAuth, acl('update'), handleUpdateOne);
profileRouter.delete('/profile', bearerAuth, acl('delete'), handleDeleteOne);

module.exports = profileRouter;
