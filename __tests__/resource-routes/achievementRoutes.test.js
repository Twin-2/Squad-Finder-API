'use strict';

require('dotenv').config();
const supertest = require('supertest');
const { app } = require('../../src/server.js');

const { db, Users, Profile, Achievements } = require('../../src/schemas/index.js');
const { expect } = require('@jest/globals');

const mockRequest = supertest(app);

beforeAll(async () => {
  await db.sync();
  const admin = await mockRequest.post('/signup').send({ username: "tester", password: "test", role: "admin" });
  const user = await mockRequest.post('/signup').send({ username: "unauthorizedUser", password: "test", role: "user" });

  const adminToken = admin.body;
  console.log('ADMIN USER INFO: ',adminToken);

  const userToken = admin.body;
  console.log('REGULAR USER INFO', userToken);

  // await mockRequest.post('/profile').send();

})

afterAll(async () => {
  await db.drop();
})

describe('Achievement route testing', () => {

  it('can create a new achievement', () => {

  });

  it('can get one specific achievement', () => {
    
  });

  it('can get all achievements associated with a user', () => {
    
  });

  it('can update a specific achievement', () => {
    
  });

  it('user without permissions cannot update achievement', () => {
    
  });

  it('can delete a specific achievement', () => {
    
  });

  it('user without permissions cannot delete achievement', () => {
    
  });

})