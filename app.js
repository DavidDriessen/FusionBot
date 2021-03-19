const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
require('./migrate');
require('./discordbot');

const app = express();

const MySQLStore = require('express-mysql-session')(session);
const options = require('./config/config')[process.env.NODE_ENV || 'development'];
app.use(session({
    key: 'FusionBot-session',
    secret: 'keyboard cat', cookie: {
        secure: require('./config/config').secure || false
    },
    store: new MySQLStore({
        host: options.host,
        user: options.username,
        password: options.password,
        database: options.database
    }),
    resave: false,
    saveUninitialized: false
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
} else {
    app.use('/', function (req, res, next) {
        if (req.url === '/') res.redirect("http://localhost:8080");
        else next();
    });
}

app.use('/discord', require('./routes/discord'));
app.use('/api', require('./routes'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/*', function (req, res, next) {
    // noinspection JSUnresolvedVariable
    if (req.xhr || req.headers.accept.indexOf('json') > -1)
        res.status(404).json({status: 'error', type: 'route', message: 'Page not found'});
    else if (app.get('env') === 'production')
        res.sendFile(path.join(__dirname, 'public/index.html'));
    else res.redirect(require("./config/config").host + req.url);
});

module.exports = app;
