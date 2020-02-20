const {Member, Availability} = require('../models');
const moment = require('moment');
const express = require('express');

const router = express.Router();

router.get('/team/re', function (req, res) {
    Member.findOne({where: {id: req.session.user.id}, include: 'team'}).then(member => {
        member.team.getAvailability().then(a => {
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
