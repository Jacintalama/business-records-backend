'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('boatrecords', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
      control_no: {
        type: Sequelize.STRING,
      },
      fish_registration_no_rsbsa: {
        type: Sequelize.STRING,
      },
      last_name: {
        type: Sequelize.STRING,
      },
      first_name: {
        type: Sequelize.STRING,
      },
      middle_name: {
        type: Sequelize.STRING,
      },
      extension_name: {
        type: Sequelize.STRING,
      },
      purok: {
        type: Sequelize.STRING,
      },
      birthday: {                 // ← new column
        type: Sequelize.DATEONLY,
        allowNull: true,          // or false if required
      },
      contact_no: {
        type: Sequelize.STRING,   // Changed from INTEGER to STRING
      },
      fishing_boat_name: {
        type: Sequelize.STRING,
      },
      make: {
        type: Sequelize.STRING,
      },
      engine_sn: {
        type: Sequelize.STRING,
      },
      no_of_fisher_man: {
        type: Sequelize.STRING,   // Changed from INTEGER to STRING
      },
      or_no: {
        type: Sequelize.STRING,   // Changed from INTEGER to STRING
      },
      amount_paid: {
        type: Sequelize.INTEGER,  
      },
      date: {
        type: Sequelize.DATE,
      },
      barangay: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('boatrecords');
  }
};
