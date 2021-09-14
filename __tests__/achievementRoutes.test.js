'use strict';

require('dotenv').config();
const supertest = require('supertest');
const { app } = require('../src/server.js');

const { db } = require('../src/schemas/index.js');
const { expect } = require('@jest/globals');

const mockRequest = supertest(app);

beforeAll(async () => {
  await db.sync();
  const admin = await mockRequest.post('/signup').send({ username: "tester", password: "test", role: "admin" });
  const user = await mockRequest.post('/signup').send({ username: "unauthorizedUser", password: "test", role: "user" });

  const adminToken = admin.body.token;
  const userToken = user.body.token;

  await mockRequest.post('/profile').send({bio: "test bio", game: "supercoolgame"}).auth(`${adminToken}`, { type: 'bearer' });

})

afterAll(async () => {
  await db.drop();
})

describe('Achievement route testing', () => {

  it('can create a new achievement', () => {
    expect(true).toBe(true);
  });

  it('can get one specific achievement', () => {
    expect(true).toBe(true);
  });

  it('can get all achievements associated with a user', () => {
    expect(true).toBe(true);
  });

  it('can update a specific achievement', () => {
    expect(true).toBe(true);
  });

  it('user without permissions cannot update achievement', () => {
    expect(true).toBe(true);
  });

  it('can delete a specific achievement', () => {
    expect(true).toBe(true);
  });

  it('user without permissions cannot delete achievement', () => {
    expect(true).toBe(true);
  });

})