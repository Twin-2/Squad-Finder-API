'use strict';

const express = require('express');
const friendsRouter = express.Router();
const { users, db } = require('../../schemas/index.js');
const bearerAuth = require('../../middleware/bearerauth.js');
const creatError = require('http-errors');
const { request } = require('express');

//this route is to show users on the Find Friends page
//route for getting all friends(users). UI will handle filtering for display.
friendsRouter.get('/findFriends', async (req, res, next) => {
    try {
        console.log('here')
        let friends = await users.findAll({})
        res.status(201).send(friends)
    } catch (err) {
        console.log(err)
        next(creatError(404, err.messege))
    }
})

// ___REFACTOR___

// route for adding frinds from the search page to the profile
friendsRouter.post('/findFriends/:id', bearerAuth, async (req, res, next) => {
    try {
        console.log('here')
        let id = req.params.id
        let userId = req.user.id
        //create a new friend on the appropriate table with the id of the user that was clicked on.
        let added = await db.models.friendRequests.create({ requesterId: userId, requesteeId: id })
        console.log(added)
        res.status(202).send(added)
    } catch (err) {
        console.log(err)
        next(creatError(404, err.messege))
    }
})

// { UserId: userId, FriendId: id }

//show all friend requests
friendsRouter.get('/friendRequests', bearerAuth, async (req, res, next) => {
    try {
        let id = req.user.id
        let requests = await db.models.friendRequests.findAll({ where: { requesteeId: id } })
        let list = await requests.map(async value => {
            let user = await users.findOne({ where: { id: value.requesterId } })
            console.log('user', user)
            return list

        })
        console.log(list)
        res.status(200).send(list)
    } catch (err) {
        console.log(err)
        next(creatError(404, err.messege))
    }
})

//route for showing friends on the friends page after they have been added
friendsRouter.get('/userFriends', (req, res, next) => {
    try {
        console.log('here')

    } catch (err) {
        console.log(err)
        next(creatError(404, err.messege))
    }
})


//route for adding friend to the user profile (creating relationship)

// route for deleting friends

module.exports = friendsRouter