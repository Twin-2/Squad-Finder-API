'use strict';

const express = require('express');
const friendsRouter = express.Router();
const { User, db } = require('../../schemas/index.js');
const bearerAuth = require('../../middleware/bearerauth.js');
const createError = require('http-errors');

const addFriendRequest = async (req, res, next) => {
  try {
    let id = req.params.id;
    let userId = req.user.id;
    let added = await db.models.friendRequests.create({
      requesterId: userId,
      requesteeId: id,
    });
    res.status(202).send(added);
  } catch (err) {
    next(createError(404, err.message));
  }
};

const findFriends = async (req, res, next) => {
  try {
    let friends = await User.findAll({});
    res.status(201).send(friends);
  } catch (err) {
    next(createError(404, err.message));
  }
};
const showAllRequests = async (req, res, next) => {
  try {
    let id = req.user.id;
    let requests = await db.models.friendRequests.findAll({
      where: { requesteeId: id },
    });
    let list = await Promise.all(
      requests.map(async (value) => {
        let data = User.findOne({
          where: { id: value.dataValues.requesterId },
        });
        return data;
      })
    );
    res.status(200).send(list);
  } catch (err) {
    next(createError(404, err.message));
  }
};
const rejectRequest = async (req, res, next) => {
  try {
    let id = req.params.id;
    let userId = req.user.id;
    let requests = await db.models.friendRequests.destroy({
      where: { requesterId: id, requesteeId: userId },
    });
    let body = {
      message: 'deleted',
      data: requests,
    };
    res.status(202).send(body);
  } catch (err) {
    next(createError(404, err.message));
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    let id = req.params.id;
    let userId = req.user.id;
    let friends = await db.models.friends.create({
      UserId: userId,
      FriendId: id,
    });
    await db.models.friendRequests.destroy({
      where: { requesterId: id, requesteeId: userId },
    });
    res.status(202).send(friends);
  } catch (err) {
    next(createError(404, err.message));
  }
};

const showFriends = async (req, res, next) => {
  try {
    let id = req.user.id;
    let friends = await db.models.friends.findAll({ where: { UserId: id } });
    let list = await Promise.all(
      friends.map(async (value) => {
        let data = await User.findOne({
          where: { id: value.dataValues.FriendId },
        });
        return data;
      })
    );
    res.status(202).send(list);
  } catch (err) {
    next(createError(404, err.message));
  }
};

const deleteFriend = async (req, res, next) => {
  try {
    let id = req.params.id;
    let userId = req.user.id;
    let notFriends = await db.models.friends.destroy({
      where: { UserId: userId, FriendId: id },
    });
    res.status(202).send('Deleted friend');
  } catch (err) {
    next(createError(404, err.message));
  }
};

const blockFriend = async (req, res, next) => {
  try {
    let id = req.params.id;
    let userId = req.user.id;
    await db.models.blockedusers.create({
      where: { UserId: userId, BlockedUserId: id },
    });
    await db.models.friends.destroy({
      where: { UserId: userId, FriendId: id },
    });
    res.status(202).send('Friend has been successfully blocked');
  } catch (err) {
    next(createError(404, err.message));
  }
};

friendsRouter.get('/users', findFriends);
friendsRouter.get('/friendRequests', bearerAuth, showAllRequests);
friendsRouter.delete('/friendRequests/:id', bearerAuth, rejectRequest);
friendsRouter.post('/friendRequests/:id', bearerAuth, acceptRequest);

friendsRouter.post('/friends/:id', bearerAuth, addFriendRequest);
friendsRouter.get('/friends', bearerAuth, showFriends);
friendsRouter.delete('/friends/:id', bearerAuth, deleteFriend);

friendsRouter.delete('/blockFriend/:id', bearerAuth, blockFriend);

module.exports = friendsRouter;
