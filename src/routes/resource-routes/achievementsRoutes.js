'use strict';

const express = require('express');
const achievementsRouter = express.Router();
const bearerAuth = require('../../middleware/bearerauth.js');
const acl = require('../../middleware/acl.js');
const { Profile, Achievement } = require('../../schemas/index.js');

const createError = require('http-errors');

const handleCreate = async (req, res, next) => {
  try {
    let { game, rank, progress, lastPlayed } = req.body;
    let profile = await Profile.findOne({ where: { UserId: req.user.id } });
    let record = await Achievement.create({
      game,
      rank,
      progress,
      lastPlayed,
      ProfileId: profile.id,
    });
    res.status(201).send(record);
  } catch (e) {
    return next(createError(500, 'Something went wrong'));
  }
};

const handleGetAll = async (req, res, next) => {
  try {
    let id = req.user.id;
    let profile = await Profile.findOne({ where: { UserId: id } });
    let records = await Achievement.findAll({
      where: { ProfileId: profile.id },
    });
    if (records.length === 0) {
      return next(createError(404, 'No achievements for this user'));
    }
    res.status(200).send(records);
  } catch (e) {
    return next(createError(500, 'Something went wrong'));
  }
};

const handleGetOne = async (req, res, next) => {
  try {
    let id = req.params.id;
    let record = await Achievement.findOne({ where: { id } });

    if (record) {
      res.status(200).send(record);
    } else {
      return next(createError(404, 'Could not find achievement'));
    }
  } catch (e) {
    return next(createError(404, 'Could not find achievement'));
  }
};

const handleUpdate = async (req, res, next) => {
  if (!req.params.id) {
    return next(
      createError(
        404,
        "Please specify which achievement you're trying to access"
      )
    );
  }

  let user = req.user.id;
  let id = req.params.id;
  let record = await Achievement.findOne({ where: { id: id } });

  if (req.user.role === 'admin' || record.UserId === user) {
    try {
      let obj = req.body;
      let updated = await Achievement.update(obj, { where: { id } });
      res.status(202).send(updated);
    } catch (e) {
      return next(createError(404, 'Could not find that achievement'));
    }
  }

  return next(
    createError(
      403,
      'Permission denied. You do not have access to perform this action.'
    )
  );
};

const handleDelete = async (req, res, next) => {
  if (!req.params.id) {
    return next(
      createError(400, "Please specify which note you're trying to access")
    );
  }
  let user = req.user.id;
  let id = req.params.id;
  let record = await Achievement.findOne({ where: { id: id } });
  if (req.user.role === 'admin' || record.UserId === user) {
    try {
      await Achievement.destroy({ where: { id } });
      res.status(202).send('achievement deleted');
    } catch (e) {
      return next(createError(404, 'Could not find achievement'));
    }
  } else {
    return next(
      createError(
        403,
        'Permission denied. You do not have access to perform this action.'
      )
    );
  }
};

achievementsRouter.post(
  '/achievements',
  bearerAuth,
  acl('create'),
  handleCreate
);
achievementsRouter.get(
  '/achievements',
  bearerAuth,
  acl('read'),
  handleGetAll
);
achievementsRouter.get(
  '/achievements/:id',
  bearerAuth,
  acl('read'),
  handleGetOne
);
achievementsRouter.put(
  '/achievements/:id',
  bearerAuth,
  acl('update'),
  handleUpdate
);
achievementsRouter.delete(
  '/achievements/:id',
  bearerAuth,
  acl('delete'),
  handleDelete
);

module.exports = achievementsRouter;
