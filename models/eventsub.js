'use strict';
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('EventSub', {
        MemberId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Members',
                key: 'id'
            }
        },
        EventId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Events',
                key: 'id'
            }
        }
    });
};
