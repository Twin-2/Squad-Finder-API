'use strict';

require('dotenv').config();
const supertest = require('supertest');
const { app } = require('../../src/server.js');

const { db } = require('../../src/schemas/index.js');
const { expect } = require('@jest/globals');

const mockRequest = supertest(app);

let adminToken;
let userToken;

let adminProfile;
let userProfile;

beforeAll(async () => {
  await db.sync();
  const admin = await mockRequest.post('/signup').send({ username: "tester", password: "test", role: "admin" });
  const user = await mockRequest.post('/signup').send({ username: "unauthorizedUser", password: "test", role: "user" });

  adminToken = admin.body.token;
  userToken = user.body.token;

  adminProfile = await mockRequest.post('/profile').send({bio: "test bio", game: "supercoolgame"}).auth(`${adminToken}`, { type: 'bearer' });
  userProfile = await mockRequest.post('/profile').send({bio: "test bio", game: "supercoolgame"}).auth(`${userToken}`, { type: 'bearer' });

})

afterAll(async () => {
  await db.drop();
})

describe('Achievement route testing', () => {

  it('can create a new achievement', async () => {
    const response = await mockRequest.post('/achievements')
      .send({ game:"test", rank:"thebest", progress:"none",lastplayed: "right now"})
      .auth(`${adminToken}`, { type: 'bearer' });
    
    expect(response.status).toBe(201);
  });

  it('can get one specific achievement', async () => {
    const response = await mockRequest.get('/achievements/1').auth(`${adminToken}`, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('can get one specific achievement even if owned by another user', async () => {
    const response = await mockRequest.get('/achievements/1').auth(`${userToken}`, { type: 'bearer' });
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('cannot get one if no achievements exist', async () => {
    const response = await mockRequest.get('/achievements/90').auth(`${adminToken}`, { type: 'bearer' });
    expect(response.status).toBe(404);
  });

  it('can get all achievements associated with a user', async () => {
    const response1 = await mockRequest.get('/achievements').auth(`${adminToken}`, { type: 'bearer' });
    expect(response1.status).toBe(200);
    expect(response1.body).toBeDefined();
  });

  it('will fail is user has no achievements', async () => {
    const response2 = await mockRequest.get('/achievements').auth(`${userToken}`, { type: 'bearer' });
    expect(response2.status).toBe(500);
  });

  it('can update a specific achievement', async () => {
    const response = await mockRequest.put('/achievements/1')
      .send({ game:"updated", rank:"updated", progress:"updated",lastplayed: "updated"})
      .auth(`${adminToken}`, { type: 'bearer' });

    expect(response.status).toBe(202);
    expect(response.body).toBeDefined();
  });

  it('user without permissions cannot update achievement', async () => {
    const response = await mockRequest.put('/achievements/1')
      .send({ game:"unauthorized", rank:"unauthorized", progress:"unauthorized",lastplayed: "unauthorized"})
      .auth(`${userToken}`, { type: 'bearer' });

    expect(response.status).toBe(403);
  });

  it('can delete a specific achievement', async () => {
    const response = await mockRequest.delete('/achievements/1').auth(`${adminToken}`, { type: 'bearer' });
    expect(response.status).toBe(202);
  });

  it('cannot delete achievement that does not exist', async () => {
    const response = await mockRequest.delete('/achievements/6').auth(`${adminToken}`, { type: 'bearer' });
    expect(response.status).toBe(202);
  });

  it('user without permissions cannot delete achievement', async () => {
    await mockRequest.post('/achievements')
      .send({ game:"test2", rank:"test2", progress:"test2",lastplayed: "test2"})
      .auth(`${adminToken}`, { type: 'bearer' });

    const response = await mockRequest.delete('/achievements/2').auth(`${userToken}`, { type: 'bearer' });
    expect(response.status).toBe(403);
  });

})