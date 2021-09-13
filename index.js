'use strict';

const { db } = require('./src/schemas/index.js');
const { start } = require('./src/server.js');
require("dotenv").config();

db.sync()
    .then(() => {
        console.log('Proof of Life: Finder Database')
        start(process.env.PORT);
    })
    .catch(console.error);