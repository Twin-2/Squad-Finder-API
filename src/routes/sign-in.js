'use strict';

const express = require('express');
const { User } = require('../schemas/index.js');
const authRouter = express.Router();
const basicAuth = require('../middleware/basicAuth');
const createError = require('http-errors');

authRouter.post('/signup', async (req, res, next) => {
  try {
    let userRecord = await User.create(req.body);
    const user = {
      user: userRecord,
      token: userRecord.token,
    };
    res.status(201).json(user);
  } catch (e) {
    if (e.message == 'Validation error') {
      // return next(new HttpError("Username in use", 409))
      return next(createError(409, 'Username in use'));
    }
    // return next(new HttpError("You need both username and password to sign up", 406))
    return next(
      createError(406, 'You need both username and password to sign up')
    );
  }
});

authRouter.post('/signin', basicAuth, async (req, res, next) => {
  try {
    //MW verify that the user's password is the same as saved hash.
    //user is saved to the req object
    //took out basic auth middleware to test
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
