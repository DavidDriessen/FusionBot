'use strict';
const Op = require('sequelize').Op;
const timeOverlap = require('time-overlap');

module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
        guild: DataTypes.STRING,
        name: DataTypes.STRING,
        icon: DataTypes.STRING,
        when2meet: DataTypes.STRING,
        channel: DataTypes.STRING,
        message: DataTypes.STRING
    }, {});
    Team.associate = function (models) {
        Team.hasMany(models.Member, {as: 'members'});
        Team.hasMany(models.Event, {as: 'events'});
        Team.hasMany(models.Proposal, {as: 'proposals'});
        Team.hasMany(models.Proposal, {as: 'proposed', foreignKey: 'toTeamId'});
    };

    Team.createTeam = function (guild, name, icon) {
        return this.findOrCreate({where: {guild: guild}, defaults: {guild: guild, name: name, icon: icon}});
    };
    Team.findByName = function (name) {
        return this.findAll({where: {name: {[Op.like]: "%" + name + "%"}}});
    };
    Team.getTeam = function (guild) {
        return this.findOne({where: {guild: guild}});
    };

    Team.prototype.getAvailability = function () {
        return this.getMembers({include: 'available'}).then(members => {
            let memAvail = [];
            for (const member of members) {
                let temp = [];
                for (const avail of member.available) {
                    temp.push(avail.start);
                    temp.push(avail.end);
                }
                memAvail.push(temp);
            }
            let cross = timeOverlap.cross(...memAvail);
            if (cross.length % 2) console.error("Cross error");
            let avail = [];
            for (let i = 0; i < cross.length; i += 2) {
                if (i === cross.length) break;
                avail.push({start: cross[i], end: cross[i + 1]});
            }
            return avail;
        });
    };
    return Team;
};
