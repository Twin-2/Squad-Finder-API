'ust strict';

require('dotenv').config();
const supertest = require('supertest');
const { app } = require('../../src/server.js');
const { db, User } = require('../../src/schemas/index.js');

const mockRequest = supertest(app)

beforeAll(async () => {
    db.sync();
    const signupA = await mockRequest.post('/signup').send({ username: "a", password: "a" })
    const signupB = await mockRequest.post('/signup').send({ username: "b", password: "b" })
    const signupC = await mockRequest.post('/signup').send({ username: "c", password: "c" })
    const signupD = await mockRequest.post('/signup').send({ username: "d", password: "d" })
});
afterAll(async () => {
    db.drop();
});

describe('FRIEND ROUTES', () => {

    it('should respond to a GET at /users with a list of all users ', async () => {
        const signin = await mockRequest.post('/signin').auth("a", "a");
        const token = signin.body.token;
        const route = await mockRequest.get('/users').auth(`${token}`, { type: 'bearer' })
        expect(route.body.length).toBe(4)
        expect(route.body[0].username).toBe('a')
        expect(route.body[1].username).toBe('b')
        expect(route.body[2].username).toBe('c')
        expect(route.body[3].username).toBe('d')
    })

    it('should respond to a GET at /friendRequests with a list of friend requests for the logged in user', () => {
        const signin = await mockRequest.post('/signin').auth("a", "a");
        const token = signin.body.token;
        const route = await mockRequest.get('/users').auth(`${token}`, { type: 'bearer' })
    })

    it('should respond to a DELETE at /friendRequests/:id with deleting that friend request and a messege saying "Deleted"', () => {

    })

    it("should respond to a POST at /friendRequests/:id by adding a friend relationship to the DB and removing the request from the DB ", () => {

    })
})