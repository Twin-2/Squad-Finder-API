'use strict';

const express = require('express');
const { User } = require('../schemas/index.js');
const authRouter = express.Router();
const basicAuth = require('../middleware/basicAuth');
const createError = require('http-errors');

authRouter.post('/signup', async (req, res, next) => {
  try {
    console.log(req.body)
    let userRecord = await User.create(req.body);
    const user = {
      user: userRecord,
      token: userRecord.token,
    };
    res.status(201).json(user);
  } catch (e) {
    if (e.message == 'Validation error') {
      return next(createError(409, 'Username in use'));
    }
    return next(
      createError(406, 'You need both username and password to sign up')
    );
  }
});

authRouter.post('/signin', basicAuth, async (req, res, next) => {
  try {
    console.log(req.body)
    const user = {
      user: req.user,
      token: req.user.token,
    };
    res.status(202).send(user);
  } catch (e) {
    return next(createError(500, err.message));
  }
});

module.exports = authRouter;
