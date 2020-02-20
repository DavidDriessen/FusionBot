const DiscordOauth2 = require("discord-oauth2");
const express = require('express');
const url = require('url');
const {Member} = require('../models');

const oauth = new DiscordOauth2();
const router = express.Router();

router.get('/login', function (req, res) {
    res.redirect(url.format({
        protocol: 'https',
        hostname: 'discordapp.com',
        pathname: 'api/oauth2/authorize',
        query: {
            client_id: '665187261436002346',
            redirect_uri: req.protocol + "://" + req.headers.host + "/discord/callback",
            response_type: 'code',
            scope: 'identify'
        }
    }));
});

router.get('/callback', function (req, res) {
    const accessCode = req.query.code;
    if (!accessCode) return res.redirect("/discord/login");

    oauth.tokenRequest({
        clientId: "665187261436002346",
        clientSecret: "SZtNKfgX5juppnWDJ_3VvgYo0U_ukmWP",

        code: accessCode,
        scope: "identify",
        grantType: "authorization_code",

        redirectUri: req.protocol + "://" + req.headers.host + "/discord/callback"
    }).then(r => {
        req.session.token = r;
        oauth.getUser(r.access_token).then(async u => {
            req.session.user = (await Member.findOrCreate({
                where: {discordUser: u.id}, defaults: {
                    name: u.username,
                    avatar: "https://cdn.discordapp.com/avatars/" + u.id + "/" + u.avatar + ".jpg"
                }
            }))[0];
            res.redirect(req.protocol + "://" + req.headers.host + "/");
        });
    }).catch(e => {
        res.status(500).send("Error communicating with discord");
        console.error(e);
    });
});

module.exports = router;
