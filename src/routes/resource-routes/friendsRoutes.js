'use strict';

const express = require('express');
const friendsRouter = express.Router();
const { User, db } = require('../../schemas/index.js');
const bearerAuth = require('../../middleware/bearerauth.js');
const createError = require('http-errors');

//this route is to show users on the Find Friends page
//route for getting all friends(users). UI will handle filtering for display.
friendsRouter.get('/findFriends', async (req, res, next) => {
    try {
        console.log('here')
        let friends = await User.findAll({})
        res.status(201).send(friends)
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
})

// ___REFACTOR___
//this file needs to have the DB actions changed over to the simpler .set<name> method
//We also need to consider how this file can be seperated due to the complexity of all the routes. 

// route for adding frinds from the search page to the friend request table
//QUESTION: What should be returned here?
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
        next(createError(404, err.message))
    }
})

// { UserId: userId, FriendId: id }

//show all friend requests
friendsRouter.get('/friendRequests', bearerAuth, async (req, res, next) => {
    try {
        let id = req.user.id
        let requests = await db.models.friendRequests.findAll({ where: { requesteeId: id } })
        let list = await Promise.all(requests.map(async value => {
            let data = User.findOne({ where: { id: value.dataValues.requesterId } })
            return data
        }))
        res.status(200).send(list)
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
})
//reject a friend request
//__ADD--STRETCH__ : send a notification to the user you rejected
friendsRouter.delete('/friendRequests/:id', bearerAuth, async (req, res, next) => {
    try {
        let id = req.params.id;
        let userId = req.user.id
        let requests = await db.models.friendRequests.destroy({ where: { requesterId: id, requesteeId: userId } })
        let body = {
            messege: "deleted",
            data: requests
        }
        res.status(202).send(body)
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
})

//accept a friend request
friendsRouter.post('/friendRequests/:id', bearerAuth, async (req, res, next) => {
    try {
        console.log('here')
        let id = req.params.id;
        let userId = req.user.id
        //take in an id, use that id to create a relationship on the friends table with the user and the friend
        let friends = await db.models.friends.create({ UserId: userId, FriendId: id })
        //remove that request off the request table
        await db.models.friendRequests.destroy({ where: { requesterId: id, requesteeId: userId } })
        res.status(202).send(friends)
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
})

//route for showing friends on the friends page after they have been added
friendsRouter.get('/userFriends', bearerAuth, async (req, res, next) => {
    try {
        console.log('here')
        let id = req.user.id
        let friends = await db.models.friends.findAll({ where: { UserId: id } })
        let list = await Promise.all(friends.map(async value => {
            console.log(value.dataValues.FriendId)
            let data = await User.findOne({ where: { id: value.dataValues.FriendId } })
            return data
        }))
        res.status(202).send(list)
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
})

// route for deleting friends
friendsRouter.delete('/userFriends/:id', bearerAuth, async (req, res, next) => {
    try {
        console.log('here')
        let id = req.params.id;
        let userId = req.user.id
        //look at friend requests for the user that is logged in
        let notFriends = await db.models.friends.destroy({ where: { UserId: userId, FriendId: id } })
        res.status(202).send('Deleted friend')
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
})


friendsRouter.get('/users')

friendsRouter.get('/friendRequests')
friendsRouter.delete('/friendRequests/:id')
friendsRouter.post('/friendRequests/:id')


friendsRouter.post('/friends/:id')
friendsRouter.delete('/friends/:id')
friendsRouter.get('/friends')

friendsRouter.delete('/blockFriend/:id')





module.exports = friendsRouter