'use strict';

const express = require('express');
const friendsRouter = express.Router();
const { User, db } = require('../../schemas/index.js');
const bearerAuth = require('../../middleware/bearerauth.js');
const createError = require('http-errors');


// ___REFACTOR___
//this file needs to have the DB actions changed over to the simpler .set<name> method
//We also need to consider how this file can be seperated due to the complexity of all the routes. 

// route for adding frinds from the search page to the friend request table
//QUESTION: What should be returned here?
const addFriendRequest = async (req, res, next) => {
    try {
        console.log('here')
        let id = req.params.id
        let userId = req.user.id
        //create a new friend on the appropriate table with the id of the user that was clicked on.
        let added = await db.models.friendRequests.create({ requesterId: userId, requesteeId: id })
        console.log(typeof added)
        res.status(202).send(added)
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
}




//this route is to show users on the Find Friends page
//route for getting all friends(users). UI will handle filtering for display.
const findFriends = async (req, res, next) => {
    try {
        console.log('here')
        let friends = await User.findAll({})
        res.status(201).send(friends)
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
}
//show all friend requests
const showAllRequests = async (req, res, next) => {
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
}
//reject a friend request
//__ADD--STRETCH__ : send a notification to the user you rejected
const rejectRequest = async (req, res, next) => {
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
}

//accept a friend request
const acceptRequest = async (req, res, next) => {
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
}


//route for showing friends on the friends page after they have been added
const showFriends = async (req, res, next) => {
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
}

// route for deleting friends
const deleteFriend = async (req, res, next) => {
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
}

// route for blocking friend

const blockFriend = async (req, res, next) => {
    try {
        console.log("@@@@@userID", req.user.id);
        let id = req.params.id;
        let userId = req.user.id;
        await db.models.blockedusers.create({ where: { UserId: userId, BlockedUserId: id } });
        await db.models.friends.destroy({ where: { UserId: userId, FriendId: id } });
        res.status(202).send('Friend has been successfully blocked');
    } catch (err) {
        console.log(err)
        next(createError(404, err.message))
    }
}


friendsRouter.get('/users', findFriends)
friendsRouter.get('/friendRequests', bearerAuth, showAllRequests)
friendsRouter.delete('/friendRequests/:id', bearerAuth, rejectRequest)
friendsRouter.post('/friendRequests/:id', bearerAuth, acceptRequest)


friendsRouter.post('/friends/:id', bearerAuth, addFriendRequest)
friendsRouter.get('/friends', bearerAuth, showFriends)
friendsRouter.delete('/friends/:id', bearerAuth, deleteFriend)

friendsRouter.delete('/blockFriend/:id', bearerAuth, blockFriend)





module.exports = friendsRouter


