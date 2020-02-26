const {Team, Member, Availability} = require('../models');
const moment = require('moment');
const express = require('express');

const router = express.Router();

router.get('/team/re', async function (req, res) {
    let team;
    if (req.query.team) {
        team = await Team.findByName(req.query.team);
        if (team === []) return res.status(404).json({msg: "No team with name: " + req.query.team});
        else team = team[0];
    } else {
        const member = await Member.findOne({where: {id: req.session.user.id}, include: 'team'});
        team = member.team;
    }
    const timeZoneOffset = req.query.timeZoneOffset ? req.query.timeZoneOffset : 0;
    const a = await team.getAvailability(req.query.cross !== "false", req.query.exclude).map(i => {
        return {
            id: i.id,
            start: moment(i.start + moment().startOf('week')).utcOffset(timeZoneOffset),
            end: moment(i.end + moment().startOf('week')).utcOffset(timeZoneOffset)
        }
    });
    res.json(a.map(m => {
        return {
            groupId: m.id,
            startTime: m.start.format("HH:mm"),
            endTime: m.end.hours() + (m.end.days() - m.start.days()) * 24
                + ":" + moment(m.end.minutes(), "m").format("mm"),
            daysOfWeek: [m.start.isoWeekday()]
        }
    }));
});
router.get('/member/re', function (req, res) {
    Member.findOne({where: {id: req.session.user.id}, include: 'team'}).then(member => {
        member.getAvailability().then(a => {
            res.json(a.map(m => {
                return {
                    groupId: m.id,
                    startTime: m.start.utcOffset(req.query.timeZoneOffset).format("HH:mm"),
                    endTime: Math.floor(m.start.hours() +
                        (m.end.utcOffset(req.query.timeZoneOffset)
                            .diff(m.start.utcOffset(req.query.timeZoneOffset)) / 1000 / 60 / 60))
                        + ":" + m.end.utcOffset(req.query.timeZoneOffset).minutes(),
                    daysOfWeek: [moment(m.start + moment().startOf('week')).isoWeekday()]
                }
            }));
        });
    });
});
router.get('/team', function (req, res) {
    Member.findOne({where: {id: req.session.user.id}, include: 'team'}).then(member => {
        member.team.getAvailability().then(a => {
            res.json(a.map(m => {
                return {
                    title: ' ',
                    start: moment(m.start + moment().startOf('week')).toISOString(),
                    end: moment(m.end + moment().startOf('week')).toISOString()
                }
            }));
        });
    });
});
router.get('/member', function (req, res) {
    Member.findOne({where: {id: req.session.user.id}}).then(member => {
        member.getAvailable().then(a => {
            res.json(a.map(m => {
                return {
                    id: m.id,
                    title: ' ',
                    start: moment(m.start + moment().startOf('week')).toISOString(),
                    end: moment(m.end + moment().startOf('week')).toISOString()
                }
            }));
        });
    });
});
router.post('/member', function (req, res) {
    Availability.findOne({where: {id: req.body.id}}).then(a => {
        a.start = moment(moment(req.body.start) - moment(req.body.start).startOf('week'));
        a.end = moment(moment(req.body.end) - moment(req.body.end).startOf('week'));
        a.save();
        res.send({
            id: a.id,
            title: ' ',
            start: moment(a.start + moment().startOf('week')).toISOString(),
            end: moment(a.end + moment().startOf('week')).toISOString()
        });
    });
});
router.put('/member', function (req, res) {
    Member.findOne({where: {id: req.session.user.id}}).then(member => {
        member.createAvailable({
            start: moment(moment(req.body.start) - moment(req.body.start).startOf('week')),
            end: moment(moment(req.body.end) - moment(req.body.end).startOf('week'))
        }).then(a => {
            res.send({
                id: a.id,
                title: ' ',
                start: moment(a.start + moment().startOf('week')).toISOString(),
                end: moment(a.end + moment().startOf('week')).toISOString()
            });
        });
    });
});
router.delete('/member', function (req, res) {
    Availability.findOne({where: {id: req.query.id}}).then(a => {
        a.destroy();
        res.send("ok");
    });
});

module.exports = router;
