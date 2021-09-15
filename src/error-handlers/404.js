'use strict';

module.exports = (req, res, next) => {
    const errorObject = {
        status: 404,
        message: 'Route not found'
    }
    res.status(404).send(errorObject)
}