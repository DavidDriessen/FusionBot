'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('EventSubs', {
            MemberId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Members',
                    key: 'id'
                }
            },
            EventId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Events',
                    key: 'id'
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('EventSubs');
    }
};
