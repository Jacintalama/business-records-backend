'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BusinessRecords', 'Nature of Business', {
      type: Sequelize.STRING,  // Adjust the type if needed (e.g., Sequelize.TEXT)
      allowNull: true,         // Change to false if this column should be required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BusinessRecords', 'Nature of Business');
  }
};
