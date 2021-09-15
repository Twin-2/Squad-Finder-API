'user strict';

const express = require('express');
const profileRouter = express.Router();
const bearerAuth = require('../../middleware/bearerauth.js')
const { User, Profile } = require('../../schemas/index.js')
// const HttpError = require("../error-handlers/http-error");
const acl = require('../../middleware/acl.js');

const handleCreate = async (req, res, next) => {
    console.log('here')
    try {
        let userid = req.user.id
        let { bio, game } = req.body
        console.log('here')
        let record = await Profile.create({ bio, game, UserId: userid })
        res.status(201).send(record)
    } catch (e) {
        // return next(new HttpError("Something went wrong", 500))
        res.status(500).send('Something went wrong.')
    }
}

const handleGetOne = async (req, res, next) => {
    //   if (!req.params.id) {
    //       // return next(new HttpError("Please specify which profile you're trying to access", 400))
    //       res.status(400).send('Please specify which profile youre trying to access.')
    //   }
    try {
        let id = req.user.id;
        let record = await Profile.findOne({ where: { UserId: id } });
        res.status(200).send(record)
    } catch (e) {
        // return next(new HttpError("Could not find that profile", 404))
        res.status(404).send('Could not find profile.')
    }
}

const handleUpdateOne = async (req, res, next) => {
    // if (!req.params.id) {
    //     // return next(new HttpError("Please specify which note you're trying to access", 400))
    //     res.status(400).send('error')
    // }
    let userid = req.user.id;
    let id = req.params.id
    let record = await Profile.findOne({ where: { UserId: userid } })
    console.log(req.user.role)
    if ((req.user.role === 'admin') || (record.UserId === userid)) {
        try {
            let obj = req.body
            let updated = await Profile.update(obj, { where: { UserId: userid } });
            res.status(202).send(updated);
        } catch (e) {
            // return next(new HttpError("Could not find that note", 404))
            res.status(404).send('error')
        }
    }
    // if (record.UserId !== userid) {
    //     // return next(new HttpError("Action forbidden. Only the user that created the note can update it.", 403))
    //     res.status(403).send('error')
    // }

}

const handleDeleteOne = async (req, res, next) => {
    // if (!req.params.id) {
    //     return next(new HttpError("Please specify which note you're trying to access", 400))
    // }
    let userid = req.user.id;
    let id = req.params.id
    let record = await Profile.findOne({ where: { UserId: userid } })
    if ((req.user.role === 'admin')) {
        try {
            let deleted = await Profile.destroy({ where: { UserId: userid } })
            res.status(202).send("profile was deleted")
        } catch (e) {
            // return next(new HttpError("Could not find that profile", 404))
            res.status(404).send("could not find that profile")
        }
    }
}
// if (record.UserId !== userid) {
//     return next(new HttpError("Action forbidden. Only the user that created the note can delete it.", 403))
// }

profileRouter.post('/profile', bearerAuth, acl('create'), handleCreate);
profileRouter.get('/profile', bearerAuth, acl('read'), handleGetOne);
profileRouter.put('/profile', bearerAuth, acl('update'), handleUpdateOne);
profileRouter.delete('/profile', bearerAuth, acl('delete'), handleDeleteOne);

module.exports = profileRouter;
