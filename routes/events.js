const moment = require('moment');
const express = require('express');
const ColorHash = require('../bin/color-hash');
const {Team, Member, Event} = require('../models');
const {Op} = require("sequelize");

const router = express.Router();
const colorHash = new ColorHash();

router.get('/member', async function (req, res) {
    const member = await Member.findOne({where: {id: req.session.user.id}});
    res.json((await member.getEvents({include: ['team']})).map(event => {
        return {
            id: event.id,
            title: event.name,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            color: colorHash.hex("Subbing: " + event.team.name + " - " + event.name)
        }
    }));
});

router.get('/team/:team?', async function (req, res) {
    let team;
    if (req.query.team) {
        team = await Team.findByName(req.query.team);
        if (team === []) return res.status(404).json({msg: "No team with name: " + req.query.team});
        else team = team[0];
    } else {
        team = req.params.team ? await Team.findOne({where: {id: req.params.team}}) : (await Member.findOne({
            where: {id: req.session.user.id},
            include: 'team'
        })).team;
    }
    let events;
    if (req.query.from)
        events = await team.getEvents({where: {start: {[Op.gte]: req.query.from}, end: {[Op.lte]: req.query.to}}});
    else
        events = await team.getEvents();
    res.json(events.map(event => {
        return {
            id: event.id,
            title: event.name,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            color: colorHash.hex(event.name)
        }
    }));
});
router.post('/team', function (req, res) {
    Event.findOne({where: {id: req.body.id}}).then(event => {
        event.name = req.body.title;
        event.start = moment(req.body.start);
        event.end = moment(req.body.end);
        event.save();
        res.send({
            id: event.id,
            title: event.name,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            color: colorHash.hex(event.name)
        });
    });
});
router.put('/team', function (req, res) {
    Member.findOne({where: {id: req.session.user.id}, include: 'team'}).then(member => {
        member.team.createEvent({
            name: req.body.title,
            start: moment(req.body.start),
            end: moment(req.body.end)
        }).then(event => {
            res.send({
                id: event.id,
                title: event.name,
                start: event.start.toISOString(),
                end: event.end.toISOString(),
                color: colorHash.hex(event.name)
            });
        });
    });
});
router.delete('/team', function (req, res) {
    Event.findOne({where: {id: req.query.id}}).then(a => {
        a.destroy();
        res.send("ok");
    });
});

module.exports = router;
