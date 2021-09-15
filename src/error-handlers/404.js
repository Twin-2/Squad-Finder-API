'use strict';

module.exports = (req, res, next) => {
    const errorObject = {
        status: 404,
        messege: 'Route not found'
    }
    res.status(404).send(errorObject)
}