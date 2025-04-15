'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the "Nature of Business" column from the BusinessRecords table
    await queryInterface.removeColumn('BusinessRecords', 'Nature of Business');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the "Nature of Business" column in case the migration is rolled back
    await queryInterface.addColumn('BusinessRecords', 'Nature of Business', {
      type: Sequelize.STRING,  // Adjust the data type if necessary
      allowNull: true,         // Adjust this option as needed
    });
  }
};
