'use strict';

const express = require('express');
const achievementsRouter = express.Router();
const bearerAuth = require('../../middleware/bearerauth.js');
const acl = require('../../middleware/acl.js');
const { achievements } = require('../../schemas/index.js');


const handleCreate = async (req, res, next) => {
  try {
      let { game, rank, progress, lastPlayed } = req.body;
      let record = await achievements.create({ game, rank, progress, lastPlayed, UserId:req.user.id })
      res.status(201).send(record);
  } catch (e) {
      return next(new HttpError("Something went wrong", 500));
  }
}


const handleGetAll = async (req, res, next) => {
  try {
      let id = req.user.id;
      // Should pull all achievements associated with one user.
      let records = await achievements.findAll({ where: { UserId: id } });
      if (records.length === 0) {
          return next(new HttpError("No achievements for this user", 404));
      }
      res.status(200).send(records);
  } catch (e) {
      return next(new HttpError("Something went wrong", 500));
  }
}


const handleGetOne = async (req, res, next) => {
  if (!req.params.id) {
      return next(new HttpError("Please specify which achievement you're trying to access", 400))
  }
  try {
      let id = req.params.id;
      let record = await achievements.findOne({ where: { id } });
      res.status(200).send(record);
  } catch (e) {
      return next(new HttpError("Could not find achievement", 404));
  }
}


const handleUpdate = async (req, res, next) => {
  if (!req.params.id) {
      return next(new HttpError("Please specify which achievement you're trying to access", 400))
  }
  let user = req.user.id;
  let id = req.params.id;
  let record = await achievements.findOne({ where: {id: id} })
  
  if ((req.user.role === 'admin') || (record.UserId === user)) {
      try {
          let obj = req.body;
          let updated = await achievements.update(obj, { where: { id } });
          res.status(202).send(updated);
      } catch (e) {
          return next(new HttpError("Could not find that achievement", 404))
      }
  } else {
      return next(new HttpError("Permission denied. You do not have access to perform this action.", 403))
  }
  
}


const handleDelete = async (req, res, next) => {
  if (!req.params.id) {
      return next(new HttpError("Please specify which note you're trying to access", 400))
  }
  let user = req.user.id;
  let id = req.params.id;
  let record = await achievements.findOne({ where: {id: id} })
  if ((req.user.role === 'admin') || (record.UserId === user)) {
      try {
          let deleted = await achievements.destroy({ where: { id } })
          res.status(202).send(deleted);
      } catch (e) {
          return next(new HttpError("Could not find that note", 404));
      }
  } else {
      return next(new HttpError("Permission denied. You do not have access to perform this action.", 403));
  }
}


achievementsRouter.post('/achievements', bearerAuth, acl('create'), handleCreate);
achievementsRouter.get('/achievements', bearerAuth, acl('read'), handleGetAll);
achievementsRouter.get('/achievements/:id', bearerAuth, acl('read'), handleGetOne);
achievementsRouter.put('/achievements/:id', bearerAuth, acl('update'), handleUpdate);
achievementsRouter.delete('/achievements/:id', bearerAuth, acl('delete'), handleDelete);


module.exports = achievementsRouter;