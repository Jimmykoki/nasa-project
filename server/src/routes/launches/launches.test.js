const request = require('supertest');
const app = require('../../app');
const {
  httpAddNewLaunch,
  httpGetAllLaunches,
  httpAbortLaunch,
} = require('./launches.controller');

describe('Test GET /launches', () => {
  test('It should respond with 200 success', async () => {
    const response = await request(app).get('/launches', httpGetAllLaunches);
    expect(response.statusCode).toBe(200);
  });
});
