'use strict';

const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
    const Proposal = sequelize.define('Proposal', {
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
        },
        accept: DataTypes.BOOLEAN
    }, {});
    Proposal.associate = function (models) {
        Proposal.belongsTo(models.Team, {as: "team"});
        Proposal.belongsTo(models.Team, {as: "to_team"});
    };
    return Proposal;
};