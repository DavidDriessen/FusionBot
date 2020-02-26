'use strict';
module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define('Member', {
        discordUser: DataTypes.STRING,
        name: DataTypes.STRING,
        avatar: DataTypes.STRING
    }, {});
    Member.associate = function (models) {
        Member.belongsTo(models.Team, {as: "team"});
        Member.hasMany(models.Availability, {as: 'available'});
        Member.belongsToMany(models.Event, {as: 'events', through: 'EventSub'});
    };

    Member.prototype.getUsername = function (discordClient) {
        return discordClient.users.get(this.discordUser).username;
    };
    return Member;
};
