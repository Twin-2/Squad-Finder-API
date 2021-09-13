'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const authrouter = require('./routes/sign-in')
const errorHandler = require('./error-handlers/errorHandler');
const friendRouter = require('./routes/resource-routes/friendsRoutes');

//require error handlers
//require routes

app.use(express.json());
app.use(cors());
app.use(authrouter)
app.use(friendRouter)
//app.use routes
//app.use errors

app.use(errorHandler);

function start(PORT) {
  app.listen(PORT, () => {
    console.log(`Proof of life on ${PORT}`);
  });
}

module.exports = {
  app,
  start,
};
