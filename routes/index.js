const express = require('express');

const router = express.Router();

router.use(function (req, res, next) {
    if (!req.session.user) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1)
            res.status(401).json({status: 'error', type: 'auth', message: 'Please login'});
        else
            res.redirect('/discord/login');
    } else {
        next();
    }
});
router.use('/availability', require('./availability'));
router.use('/events', require('./events'));
router.use('/user', require('./user'));

module.exports = router;
