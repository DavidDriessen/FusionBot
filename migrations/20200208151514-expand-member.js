'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'Members',
        'avatar',
        Sequelize.STRING
    );
    return queryInterface.addColumn(
        'Members',
        'subber',
        Sequelize.BOOL
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
        'Members',
        'avatar'
    );
    return queryInterface.removeColumn(
        'Members',
        'subber'
    );
  }
};
