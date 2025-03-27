'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applicants', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      applicantName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      applicantAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      capitalInvestment: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Applicants');
  }
};
