const express = require('express');
const {Member} = require('../models');

const router = express.Router();


router.get('/logout', function (req, res) {
    res.json(req.session);
    req.session.destroy();
});

router.get('/', async function (req, res) {
    res.json(await Member.findOne({
            where: {id: req.session.user.id},
            include: 'team'
        }));
});

module.exports = router;
