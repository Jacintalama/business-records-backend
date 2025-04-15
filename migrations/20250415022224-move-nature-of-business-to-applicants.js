'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add "Nature of Business" column to Applicants, placing it after the "businessName" column.
    await queryInterface.addColumn('Applicants', 'Nature of Business', {
      type: Sequelize.STRING,      // Adjust the data type if needed (e.g., Sequelize.TEXT)
      allowNull: true,             // Set to false if you want to require a value
      after: 'businessName',       // Place the column right after businessName (MySQL/MariaDB only)
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the "Nature of Business" column from Applicants on rollback
    await queryInterface.removeColumn('Applicants', 'Nature of Business');
  }
};
