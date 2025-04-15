'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BusinessRecords', 'mayorsPermitVideoK');
    await queryInterface.removeColumn('BusinessRecords', 'mayorsPermitHouseAccommodation');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BusinessRecords', 'mayorsPermitVideoK', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('BusinessRecords', 'mayorsPermitHouseAccommodation', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
