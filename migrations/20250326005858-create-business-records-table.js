'use strict';
const { Model } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure the uuid-ossp extension is enabled
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    await queryInterface.createTable('BusinessRecords', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      applicantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Applicants',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      // Add the userId column to reference Users table
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      // Year column explicitly as integer
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: Sequelize.DATE,
      gross: Sequelize.STRING,
      orNo: Sequelize.STRING,
      busTax: Sequelize.STRING,
      mayorsPermit: Sequelize.STRING,
      sanitaryInps: Sequelize.STRING,
      policeClearance: Sequelize.STRING,
      taxClearance: Sequelize.STRING,
      garbage: Sequelize.STRING,
      garbageCollection: Sequelize.STRING,  // New column added
      polluters: Sequelize.STRING,          // New column added
      Occupation: Sequelize.STRING,         // New column added
      verification: Sequelize.STRING,
      weightAndMass: Sequelize.STRING,
      healthClearance: Sequelize.STRING,
      secFee: Sequelize.STRING,
      menro: Sequelize.STRING,
      docTax: Sequelize.STRING,
      eggsFee: Sequelize.STRING,
      // Removed market column
      marketCertification: Sequelize.STRING,
      surcharge25: Sequelize.STRING,
      sucharge2: Sequelize.STRING, 
      miscellaneous: Sequelize.STRING,
      totalPayment: Sequelize.STRING,
      remarks: Sequelize.STRING,
      // New frequency column:
      frequency: {
         type: Sequelize.ENUM('quarterly', 'semi-annual', 'annual'),
         allowNull: false,
         defaultValue: 'annual'
      },
      // New renewed field:
      renewed: {
         type: Sequelize.BOOLEAN,
         allowNull: false,
         defaultValue: false
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
    await queryInterface.dropTable('BusinessRecords');
  }
};
