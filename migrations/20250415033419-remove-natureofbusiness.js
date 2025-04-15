'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the column "Nature of Business" (including space)
    await queryInterface.removeColumn('BusinessRecords', 'Nature of Business');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the column "Nature of Business" back to the "BusinessRecords" table.
    // Adjust the options (like data type and allowNull) to match your original definition.
    await queryInterface.addColumn('BusinessRecords', 'Nature of Business', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
