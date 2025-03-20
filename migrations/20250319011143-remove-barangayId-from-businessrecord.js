'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BusinessRecords', 'barangayId');
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('BusinessRecords');
    if (!tableDesc.barangayId) {
      await queryInterface.addColumn('BusinessRecords', 'barangayId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Barangays', // This should match your actual table name and key
          key: 'id',
        }
      });
    }
  }
};
