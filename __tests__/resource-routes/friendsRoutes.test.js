'ust strict';

require('dotenv').config();
const supertest = require('supertest');
const { app } = require('../../src/server.js');
const { db, User, Profile } = require('../../src/schemas/index.js');

const mockRequest = supertest(app);

let AToken;
let BToken;
let CToken;
let DToken;

beforeEach(async () => {
  await db.sync();
  const A = await mockRequest
    .post('/signup')
    .send({ username: 'a', password: 'a' });
  const B = await mockRequest
    .post('/signup')
    .send({ username: 'b', password: 'b' });
  const C = await mockRequest
    .post('/signup')
    .send({ username: 'c', password: 'c' });
  const D = await mockRequest
    .post('/signup')
    .send({ username: 'd', password: 'd' });

  AToken = A.body.token;
  BToken = B.body.token;
  CToken = C.body.token;
  DToken = D.body.token;
  await mockRequest
    .post('/profile')
    .auth(`${AToken}`, { type: 'bearer' })
    .send({ bio: 'a', game: 'Mineraft' });
  await mockRequest
    .post('/profile')
    .auth(`${BToken}`, { type: 'bearer' })
    .send({ bio: 'b', game: 'Madden' });
  await mockRequest
    .post('/profile')
    .auth(`${CToken}`, { type: 'bearer' })
    .send({ bio: 'c', game: 'Madden' });
  await mockRequest
    .post('/profile')
    .auth(`${DToken}`, { type: 'bearer' })
    .send({ bio: 'd', game: 'Madden' });

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

  it("should respond to a POST at /friendRequests/:id by adding a friend request relationship to the DB ", async () => {
    const response = await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });

    expect(response.body).toBeDefined();
    expect(response.status).toBe(202);
  })

  it('should respond to a GET at /friendRequests with a list of friend requests for the logged in user', async () => {
    await mockRequest.post('/friendRequests/1').auth(`${BToken}`, { type: 'bearer' });
    await mockRequest.post('/friendRequests/1').auth(`${CToken}`, { type: 'bearer' });
    const response = await mockRequest.get('/friendRequests').auth(`${AToken}`, { type: 'bearer' });
    expect(response.body.length).toBe(2);
    expect(response.body).toBeDefined();
    expect(response.body[0].username).toBeDefined();
    expect(response.status).toBe(200);
  })


  it("should respond to a POST at /friends/:id by adding a friend relationship to the DB and removing the request from the DB ", async () => {
    await mockRequest.post('/friendRequests/1').auth(`${BToken}`, { type: 'bearer' });
    const response = await mockRequest.post('/friends/2').auth(`${AToken}`, { type: 'bearer' });

    expect(response.body.FriendId).toBe('2');
    expect(response.status).toBe(202);
  })

  it('should respond to a DELETE at /friendRequests/:id with deleting that friend request and a message saying "deleted"', async () => {
    await mockRequest.post('/friends/1').auth(`${BToken}`, { type: 'bearer' });
    const response = await mockRequest.delete('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
    expect(response.body.message).toBe('deleted');
    expect(response.status).toBe(202);
  })

  it("should respond to a GET at /friends with a list of all a user's friends ", async () => {
    await mockRequest.post('/friendRequests/1').auth(`${BToken}`, { type: 'bearer' });
    await mockRequest.post('/friendRequests/1').auth(`${CToken}`, { type: 'bearer' });
    await mockRequest.post('/friends/2').auth(`${AToken}`, { type: 'bearer' });
    await mockRequest.post('/friends/3').auth(`${AToken}`, { type: 'bearer' });
    const response = await mockRequest.get('/friends').auth(`${AToken}`, { type: 'bearer' });
    expect(response.body.length).toBe(2);
    expect(response.status).toBe(202)
    expect(response.body[0].username).toBeDefined();
  })


  it("should respond to an omni-directional DELETE at /friends/:id by removing the friend relationship from the DB in omni-directional ", async () => {
    await mockRequest.post('/friendRequests/1').auth(`${BToken}`, { type: 'bearer' });
    await mockRequest.post('/friends/2').auth(`${AToken}`, { type: 'bearer' });
    const response1 = await mockRequest.delete('/friends/2').auth(`${AToken}`, { type: 'bearer' });

    await mockRequest.post('/friendRequests/1').auth(`${BToken}`, { type: 'bearer' });
    await mockRequest.post('/friends/2').auth(`${AToken}`, { type: 'bearer' });
    const response2 = await mockRequest.delete('/friends/1').auth(`${BToken}`, { type: 'bearer' });
    expect(response1.text).toBe('Deleted friend');
    expect(response1.status).toBe(202);
    expect(response2.text).toBe('Deleted friend');
    expect(response2.status).toBe(202);
  })

  it("should respond to a DELETE at /blockFriend/:id by removing the friend relationship from the DB and adding a blocked relationship to the DB ", async () => {
    await mockRequest.post('/friendRequests/1').auth(`${BToken}`, { type: 'bearer' });
    await mockRequest.post('/friends/2').auth(`${AToken}`, { type: 'bearer' });
    const response = await mockRequest.delete('/blockFriend/1').auth(`${BToken}`, { type: 'bearer' });
    expect(response.status).toBe(202)
    expect(response.text).toBe('Friend has been successfully blocked')
  })

  it('should respond with ERROR at POST /friendRequests/:id if user attempts to request themselves as friend ', async () => {
    const request = await mockRequest.post('/friendRequests/1').auth(`${AToken}`, { type: 'bearer' });
    expect(request.status).toBe(406);
    expect(request.body.message).toBe('Cannot add yourself as friend')
  })

  it('should respond with ERROR at POST /friendRequests/:id if request already exists ', async () => {
    await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
    const request = await mockRequest.post('/friendRequests/2').auth(`${AToken}`, { type: 'bearer' });
    expect(request.status).toBe(500);
    expect(request.body.message).toBeDefined();
  })

  it('should response with ERROR at GET /friendRequests if no friend requests exist for user ', async () => {
    const request = await mockRequest.get('/friendRequests').auth(`${AToken}`, { type: 'bearer' });
    expect(request.status).toBe(404);
    expect(request.body.message).toBe('No requests found');
  })

  it('should response with ERROR at GET /users if the database crashes', async () => {
    await db.drop()
    const request = await mockRequest.get('/users').auth(`${AToken}`, { type: 'bearer' });
    expect(request.status).toBe(500);
    expect(request.body.message).toBeDefined();
  })
})