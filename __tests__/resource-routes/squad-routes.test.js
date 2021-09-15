require('dotenv').config();

const supertest = require('supertest');
const { app } = require('../../src/server');
const { db } = require('../../src/schemas/index.js');
const { expect } = require('@jest/globals');

const mockRequest = supertest(app);

beforeAll(async () => {
  await db.sync();
  const jeff = await mockRequest
    .post('/signup')
    .send({ username: 'jeff', password: 'password' });
  const steve = await mockRequest
    .post('/signup')
    .send({ username: 'steve', password: 'password' });
  const dill = await mockRequest
    .post('/signup')
    .send({ username: 'dill', password: 'password' });
});

afterAll(async () => {
  await db.drop();
});

describe('Squad Routes', () => {
  it('Should be able to create a squad from a list of users', async () => {
    const request = await mockRequest.post('/signin').auth('jeff', 'password');
    const token = request.body.token;
    const response = await mockRequest
      .post('/squads')
      .send({ squadmates: ['steve', 'dill'] })
      .auth(`${token}`, { type: 'bearer' });
    expect(response.status).toBe(201);
  });

  it('Should be able to retrieve a users current squads', async () => {
    const request = await mockRequest.post('/signin').auth('jeff', 'password');
    const token = request.body.token;
    const response = await mockRequest
      .get('/squads')
      .auth(`${token}`, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(typeof response.body.squads).toBe('object');
  });

  it('Should prevent you from deleting a squad if you are not the owner', async () => {
    const request = await mockRequest.post('/signin').auth('dill', 'password');
    const token = request.body.token;
    const response = await mockRequest
      .delete('/squads')
      .send({ SquadId: 1 })
      .auth(`${token}`, { type: 'bearer' });
    expect(response.status).toBe(403);
  });

  it('Should be able to delete a squad if you are the squad owner', async () => {
    const request = await mockRequest.post('/signin').auth('jeff', 'password');
    const token = request.body.token;
    const response = await mockRequest
      .delete('/squads')
      .send({ SquadId: 1 })
      .auth(`${token}`, { type: 'bearer' });
    expect(response.status).toBe(202);
  });
});
