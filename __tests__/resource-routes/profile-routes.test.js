require('dotenv').config();

const supertest = require('supertest');
const { app } = require('../../src/server.js');
const { db } = require('../../src/schemas/index.js');
const { expect } = require('@jest/globals');

const mockRequest = supertest(app);

beforeAll(async () => {
  await db.sync();
  const user = await mockRequest.post('/signup').send({ username: "test", password: "password" })
})

afterAll(async () => {
  await db.drop();
})

describe('Profile Routes', () => {

  it('should respsond to a POST request at /profile with a 201 and a profile object if the user is logged in', async () => {
    const request = await mockRequest.post('/signin').auth('test','password')
    const token = request.body.token
    const route = await mockRequest.post('/profile').send({ bio: "test bio", game: "Minecraft" }).auth(`${token}`, { type: 'bearer' })
    expect(route.status).toBe(201)
    expect(typeof route.body).toBe('object')
  })

  it('should response to a GET request at /profile with a 200 and a profile object if the user is logged in', async() => {
    const request = await mockRequest.post('/signin').auth('test','password')
    const token = request.body.token
    const route = await mockRequest.get('/profile').auth(`${token}`, {type: 'bearer' })
    expect(route.status).toBe(200)
    expect(typeof route.body).toBe('object')
  })


  it('should response to a PUT request at /profile with a 202 and a profile object if the user is logged in', async() => {
    const request = await mockRequest.post('/signin').auth('test','password')
    const token = request.body.token
    const route = await mockRequest.put('/profile').send({ bio: "test bio - edited", game: "Fortnite" }).auth(`${token}`, {type: 'bearer' })
    expect(route.status).toBe(202)
    expect(typeof route.body).toBe('object')
  })

  it('should respond to a DELETE at /profile with 201 and a deleted message, if the user is logged in', async () => {
    const request = await mockRequest.post('/signin').auth('test', 'password');
    const token = request.body.token;
    const route = await mockRequest.delete('/profile').auth(`${token}`, { type: 'bearer' })
    expect(route.status).toBe(202);
    expect(typeof route.body).toBe('object')
  })

})