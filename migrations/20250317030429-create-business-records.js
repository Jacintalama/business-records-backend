'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BusinessRecords', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      gross: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      orNo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      busTax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      mayorsPermit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      sanitaryInps: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      policeClearance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      taxClearance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      garbage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      verification: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      weightAndMass: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      healthClearance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      secFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      menro: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      docTax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      eggsFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      market: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      surcharge25: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      surcharge5: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      totalPayment: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
   
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BusinessRecords');
  }
};
