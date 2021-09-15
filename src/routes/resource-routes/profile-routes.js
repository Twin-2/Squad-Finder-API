'user strict'

const express = require('express');
const profileRouter = express.Router();
const bearerAuth = require('../../middleware/bearerauth.js')
const { Profile } = require('../../schemas/index.js')
const acl = require('../../middleware/acl.js');

const handleCreate = async (req, res, next) => {
    try {
        let userid = req.user.id
        let { bio, game } = req.body
        let record = await Profile.create({ bio, game, UserId: userid })
        res.status(201).send(record)
    } catch (e) {
        res.status(500).send('Profile could not be creted.')
    }
}

const handleGetOne = async (req, res, next) => {
    try {
        let userid = req.user.id;
        let record = await Profile.findOne({ where: { UserId: userid } });
        res.status(200).send(record)
    } catch (e) {
        res.status(404).send('Could not find profile.')
    }
}

const handleUpdateOne = async (req, res, next) => {
    let userid = req.user.id;
    let record = await Profile.findOne({ where: { UserId: userid } })
    if ((req.user.role === 'admin') || (record.UserId === userid)) {
        try {
            let obj = req.body
            await Profile.update(obj, { where: { UserId: userid } });
            record = await Profile.findOne({ where: { UserId: userid } })
            res.status(202).send(record);
        } catch (e) {
            res.status(404).send('Could not find profile.')
        }
    }
}

const handleDeleteOne = async (req, res, next) => {
    let userid = req.user.id;
    if ((req.user.role === 'admin')) {
        try {
            await Profile.destroy({ where: { UserId: userid } })
            res.status(202).send('Profile was deleted.')
        } catch (e) {
            res.status(404).send('Could not find profile.')
        }
    }
}

profileRouter.post('/profile', bearerAuth, acl('create'), handleCreate);
profileRouter.get('/profile', bearerAuth, acl('read'), handleGetOne)
profileRouter.put('/profile', bearerAuth, acl('update'), handleUpdateOne)
profileRouter.delete('/profile', bearerAuth, acl('delete'), handleDeleteOne)

module.exports = profileRouter;