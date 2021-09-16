'use strict';

const express = require('express');
const friendsRouter = express.Router();
const { User, db, Profile } = require('../../schemas/index.js');
const bearerAuth = require('../../middleware/bearerauth.js');
const createError = require('http-errors');

const addFriendRequest = async (req, res, next) => {
    try {
        let id = req.params.id
        let userId = req.user.id
        if (id == userId) { next(createError(406, 'Cannot add yourself as friend')) }
        //create a new friend on the appropriate table with the id of the user that was clicked on.
        let added = await db.models.friendRequests.create({ requesterId: userId, requesteeId: id })
        res.status(202).send(added)
    } catch (err) {
        console.log(err)
        next(createError(500, err.message))
    }
}

//this route is to show users on the Find Friends page
//route for getting all friends(users). UI will handle filtering for display.
const getAllUsers = async (req, res, next) => {
    try {
        let users = await Profile.findAll({});
        if (users.length === 0) { next(createError(404, 'No users found')) }
        res.status(201).send(users)
    } catch (err) {
        console.log(err)
        next(createError(500, err.message))
    }
}
//show all friend requests
const showAllRequests = async (req, res, next) => {
    try {
        let id = req.user.id
        let requests = await db.models.friendRequests.findAll({ where: { requesteeId: id } })
        let list = await Promise.all(requests.map(async value => {
            let data = Profile.findOne({ where: { UserId: value.dataValues.requesterId } })
            return data
        }))
        if (list.length === 0) { next(createError(404, 'No requests found')) }
        res.status(200).send(list)
    } catch (err) {
        console.log(err)
        next(createError(500, err.message))
    }
}

const rejectRequest = async (req, res, next) => {
    try {
        let id = req.params.id;
        let userId = req.user.id
        let requests = await db.models.friendRequests.destroy({ where: { requesterId: id, requesteeId: userId } })
        let body = {
            message: "deleted",
            data: requests
        }
        res.status(202).send(body)
    } catch (err) {
        console.log(err);
        next(createError(500, err.message));
    }
}

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
        console.log(err);
        next(createError(500, err.message));
    }
}


const showFriends = async (req, res, next) => {
    try {
        let id = req.user.id
        let friends = await db.models.friends.findAll({ where: { UserId: id } })
        let list = await Promise.all(friends.map(async value => {
            let data = await Profile.findOne({ where: { UserId: value.dataValues.FriendId } })
            return data
        }))
        res.status(202).send(list)
    } catch (err) {
        console.log(err)
        next(createError(500, err.message))
    }
}


const deleteFriend = async (req, res, next) => {
    try {
        let id = req.params.id;
        let userId = req.user.id
        //look at friend requests for the user that is logged in
        let notFriends = await db.models.friends.destroy({ where: { UserId: userId, FriendId: id } })
        res.status(202).send('Deleted friend')
    } catch (err) {
        console.log(err)
        next(createError(500, err.message))
    }
}

// route for blocking friend
const blockFriend = async (req, res, next) => {
    try {
        let id = req.params.id;
        let userId = req.user.id;
        await db.models.blockedusers.create({ UserId: userId, BlockedUserId: id });
        const response = await db.models.friends.destroy({ where: { UserId: userId, FriendId: id } });
        res.status(202).send('Friend has been successfully blocked');
    } catch (err) {
        console.log(err)
        next(createError(500, err.message))
    }
}

friendsRouter.get('/users', getAllUsers)
friendsRouter.get('/friendRequests', bearerAuth, showAllRequests)
friendsRouter.delete('/friendRequests/:id', bearerAuth, rejectRequest)
friendsRouter.post('/friends/:id', bearerAuth, acceptRequest)
friendsRouter.post('/friendRequests/:id', bearerAuth, addFriendRequest)
friendsRouter.get('/friends', bearerAuth, showFriends)
friendsRouter.delete('/friends/:id', bearerAuth, deleteFriend)
friendsRouter.delete('/blockFriend/:id', bearerAuth, blockFriend)

module.exports = friendsRouter