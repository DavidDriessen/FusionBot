const express = require('express');
const {Team, Member} = require('../models');

const router = express.Router();


router.get('/logout', function (req, res) {
    res.json(req.session);
    req.session.destroy();
});

router.get('/', async function (req, res) {
    res.json(await Member.findOne({
        where: {id: req.session.user.id},
        include: [{as: 'team', model: Team, include: 'members', required: false}]
    }));
});
router.get('/:team', async function (req, res) {
    res.json({
        subber: null,
        name: "",
        avatar: "",
        team: (await Team.findByName(req.params.team))[0]
    });
});


module.exports = router;
