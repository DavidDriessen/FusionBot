'use strict';
const moment = require("moment");
moment.updateLocale('en', {
    week: {
        dow: 1,
    },
});
moment.tz.setDefault("utc");

module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
        name: DataTypes.STRING,
        start: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('start'));
            },
            set(val) {
                this.setDataValue('start', val.format("YYYY-MM-DD HH:mm:ss.SSS"));
            }
        },
        end: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('end'));
            },
            set(val) {
                this.setDataValue('end', val.format("YYYY-MM-DD HH:mm:ss.SSS"));
            }
        }
    }, {});
    Event.associate = function (models) {
        Event.belongsTo(models.Team, {as: "team"});
        Event.belongsToMany(models.Member, {as: 'subs', through: 'EventSub'});
    };
    return Event;
};
