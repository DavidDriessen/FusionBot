'use strict';
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
    const Availability = sequelize.define('Availability', {
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
    Availability.associate = function (models) {
        Availability.belongsTo(models.Member, {as: "member"});
    };
    return Availability;
};