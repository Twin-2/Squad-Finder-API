require('dotenv').config();

const supertest = require('supertest');
const { app } = require('../src/server.js');
const { db } = require('../src/schemas/index.js');
const { expect } = require('@jest/globals');

const mockRequest = supertest(app);

beforeAll(async () => {
  await db.sync();
  const user = await mockRequest.post('/signup').send({ username: "test", password: "password" })
})

afterAll(async () => {
  await db.drop();
})

describe('AUTH ROUTES', () => {

  it('should respond to a POST at /signup with a 201 and object when provided with a username and password', async () => {
      const request = await mockRequest.post('/signup').send({ username: "test2", password: "password" });
      expect(request.status).toBe(201);
      expect(typeof request.body).toBe('object')
  })

  it('should respond to a POST at /signup with a 406 if no username and password are provided', async () => {
      const request = await mockRequest.post('/signup').send({})
      expect(request.status).toBe(406)
  })

  it('should respond to a POST at /signup with a 409 if user already exists', async () => {
      const request = await mockRequest.post('/signup').send({ username: "test", password: "password" });
      expect(request.status).toBe(409)
  })

  it('should respond to a POST at /signin with a status of 202 and a token on the user', async () => {
      const request = await mockRequest.post('/signin').auth('test', 'password')
      const token = request.body.token;
      expect(request.status).toBe(202);
      expect(token).toBeDefined();
  })


})