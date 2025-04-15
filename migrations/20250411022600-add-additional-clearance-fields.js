'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the "barangayClearance" column to the "BusinessRecords" table
    await queryInterface.addColumn('BusinessRecords', 'barangayClearance', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if required
    });
    
    // Add the "mayorsPermitVideoK" column to the "BusinessRecords" table
    await queryInterface.addColumn('BusinessRecords', 'mayorsPermitVideoK', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if required
    });
    
    // Add the "mayorsPermitHouseAccommodation" column to the "BusinessRecords" table
    await queryInterface.addColumn('BusinessRecords', 'mayorsPermitHouseAccommodation', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if required
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the newly added columns in case of rollback
    await queryInterface.removeColumn('BusinessRecords', 'barangayClearance');
    await queryInterface.removeColumn('BusinessRecords', 'mayorsPermitVideoK');
    await queryInterface.removeColumn('BusinessRecords', 'mayorsPermitHouseAccommodation');
  }
};
