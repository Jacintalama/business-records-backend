'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This adds the 'zoningClearance' column of type STRING to the 'BusinessRecords' table.
    await queryInterface.addColumn('BusinessRecords', 'zoningClearance', {
      type: Sequelize.STRING,
      allowNull: true, // You can change this to false if you want the field required
      // You can also set other options like defaultValue here.
    });
  },

  down: async (queryInterface, Sequelize) => {
    // This reverts the changes made in the up function, removing the 'zoningClearance' column.
    await queryInterface.removeColumn('BusinessRecords', 'zoningClearance');
  }
};
