'ust strict';

require('dotenv').config();
const supertest = require('supertest');
const { app } = require('../../src/server.js');
const { db, User } = require('../../src/schemas/index.js');

const mockRequest = supertest(app)

let AToken;
let BToken;
let CToken;
let DToken;

beforeEach(async () => {
    await db.sync();
    const A = await mockRequest.post('/signup').send({ username: "a", password: "a" })
    const B = await mockRequest.post('/signup').send({ username: "b", password: "b" })
    const C = await mockRequest.post('/signup').send({ username: "c", password: "c" })
    const D = await mockRequest.post('/signup').send({ username: "d", password: "d" })

    AToken = A.body.token;
    BToken = B.body.token;
    CToken = C.body.token;
    DToken = D.body.token;

});
afterEach(async () => {
    await db.drop();
});

describe('FRIEND ROUTES', () => {

    it('should respond to a GET at /users with a list of all users ', async () => {
        const route = await mockRequest.get('/users').auth(`${AToken}`, { type: 'bearer' })
        expect(route.body.length).toBe(4)
        expect(route.body[0].username).toBe('a')
        expect(route.body[1].username).toBe('b')
        expect(route.body[2].username).toBe('c')
        expect(route.body[3].username).toBe('d')
    })

    it("should respond to a POST at /friends/:id by adding a friend request relationship to the DB ", async () => {
        const response = await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
        console.log('@@@@TEST@@@@', response.body);
        //verify id for third test.
        expect(response.body).toBeDefined();
        expect(response.status).toBe(202);
    })

    it('should respond to a GET at /friendRequests with a list of friend requests for the logged in user', async () => {
        // friend request sent to user A from user B
        await mockRequest.post('/friends/1').auth(`${BToken}`, { type: 'bearer' });
        // friend request sent to user A from user C
        await mockRequest.post('/friends/1').auth(`${CToken}`, { type: 'bearer' });
        // list of all pending friend requests
        const response = await mockRequest.get('/friendRequests').auth(`${AToken}`, { type: 'bearer' });
        // console.log('response', response)
        // ERROR response.body.length is empty array
        expect(response.body.length).toBe(2);
        expect(response.body).toBeDefined();
        expect(response.status).toBe(200);
    })


    it("should respond to a POST at /friendRequests/:id by adding a friend relationship to the DB and removing the request from the DB ", async () => {
        // friend request sent to user A from user B
        const request = await mockRequest.post('/friends/1').auth(`${BToken}`, { type: 'bearer' });
        // console.log('@@@@TEST@@@@', request);
        // friend request from user B accepted by user A
        const response = await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
        console.log('friend obj', response.body.FriendId)
        // we should be able to access the FriendId property, which should have the id of 2.
        // ERROR currently undefined.
        expect(response.body.FriendId).toBe('2');
        expect(response.status).toBe(202);
    })

    it('should respond to a DELETE at /friendRequests/:id with deleting that friend request and a message saying "deleted"', async () => {
        // friend request sent to user A from user B
        const request = await mockRequest.post('/friends/1').auth(`${BToken}`, { type: 'bearer' });
        // friend request from user B deleted by user A
        const response = await mockRequest.delete('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
        expect(response.body.message).toBe('deleted');
        expect(response.status).toBe(202);
    })

    it("should respond to a GET at /friends with a list of all a user's friends ", async () => {
        // friend request sent to user A from user B
        await mockRequest.post('/friends/1').auth(`${BToken}`, { type: 'bearer' });
        // friend request sent to user A from user C
        await mockRequest.post('/friends/1').auth(`${CToken}`, { type: 'bearer' });
        // friend request from user B accepted by user A
        await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
        // friend request from user C accepted by user A
        await mockRequest.post('/friendRequests/3').auth(`${AToken}`, { type: 'bearer' });
        // list of all user A friends
        const response = await mockRequest.get('/friends').auth(`${AToken}`, { type: 'bearer' });

        expect(response.body.length).toBe(2);
        expect(response.status).toBe(202)
    })

    it("should respond to a DELETE at /friends/:id by removing the friend relationship from the DB ", async () => {
        // friend request sent to user A from user B
        await mockRequest.post('/friends/1').auth(`${BToken}`, { type: 'bearer' });
        // friend request from user B accepted by user A
        await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
        // friendship with user A is deleted by user B
        const response = await mockRequest.delete('/friends/1').auth(`${BToken}`, { type: 'bearer' });

        // expect(response.body).toBe('Deleted Friend');
        expect(response.status).toBe(202);
    })

    xit("should respond to a DELETE at /blockFriend/:id by removing the friend relationship from the DB and adding a blocked relationship to the DB ", async () => {
        // friend request sent to user A from user B
        const request = await mockRequest.post('/friends/1').auth(`${BToken}`, { type: 'bearer' });
        console.log('@@@@TEST@@@@', request);
        // friend request from user B accepted by user A
        await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
        // user B is blocked by user A
        const response = await mockRequest.delete('/blockFriend/1').auth(`${BToken}`, { type: 'bearer' });

        expect(response.status).toBe(202)
        expect(response.body).toBe('Friend has been successfully blocked')
    })
    // POSSIBLE ERROR - Are variables aligned with a specific user? If the user's id was stored under the FriendId and not the UserId, when we isolate the record will the id's match up with the req.user.id value for the person requesting the block or the delete?
})