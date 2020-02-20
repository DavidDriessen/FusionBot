const moment = require('moment');
const express = require('express');
const ColorHash = require('../bin/color-hash');
const {Team, Member, Event} = require('../models');

const router = express.Router();

router.get('/member', async function (req, res) {
    res.json(req.session.user);
    return ;
    const colorHash = new ColorHash();
    const member = await Member.findOne({where: {discordUser: req.session.user.id}});
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
    let team = req.params.team ? await Team.findOne({where: {id: req.params.team}}) : (await Member.findOne({
        where: {id: req.session.user.id},
        include: 'team'
    })).team;
    const colorHash = new ColorHash();
    const events = await team.getEvents();
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
    Event.findOne({where: {id: req.body.id}}).then(a => {
        a.name = req.body.title;
        a.start = moment(req.body.start);
        a.end = moment(req.body.end);
        a.save();
        res.send({
            id: a.id,
            title: a.name,
            start: a.start.toISOString(),
            end: a.end.toISOString()
        });
    });
});
router.put('/team', function (req, res) {
    Member.findOne({where: {discordUser: req.session.user.id}, include: 'team'}).then(member => {
        member.team.createEvent({
            name: req.body.title,
            start: moment(req.body.start),
            end: moment(req.body.end)
        }).then(a => {
            res.send({
                id: a.id,
                title: a.name,
                start: a.start.toISOString(),
                end: a.end.toISOString()
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
