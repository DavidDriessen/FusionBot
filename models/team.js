'use strict';
const Op = require('sequelize').Op;
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
        guild: DataTypes.STRING,
        name: DataTypes.STRING,
        icon: DataTypes.STRING,
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

    function overlap(a) {
        function f(c, a) {
            if (a.length === 0) return c;
            const tempA = a.shift();
            const temp = [];
            for (let a1 = 0; a1 < c.length; a1++) {
                for (let a2 = 0; a2 < tempA.length; a2++) {
                    temp.push(c[a1].intersect(tempA[a2]));
                }
            }
            return f(temp.filter(a => a), a);
        }

        if (a.length === 0) return [];
        return f(a.shift(), a);
    }

    Team.prototype.getAvailability = function (cross = true, excludedMembers = []) {
        return this.getMembers({where: {id: {[Op.notIn]: excludedMembers}}, include: 'available'}).then(members => {
            if (!cross) return [].concat.apply([], members.map(m => m.available));
            return overlap(members.map(member => member.available.map(a => moment().range(a.start, a.end))));
        });
    };
    return Team;
};
