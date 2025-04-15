'use strict';
module.exports = (sequelize, DataTypes) => {
  const Boatrecord = sequelize.define('Boatrecord', {
    status: {
      type: DataTypes.STRING,
    },
    control_no: {
      type: DataTypes.STRING,
    },
    fish_registration_no_rsbsa: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    middle_name: {
      type: DataTypes.STRING,
    },
    extension_name: {
      type: DataTypes.STRING,
    },
    purok: {
      type: DataTypes.STRING,
    },
    birthday: {                  // ← new field
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    contact_no: {
      type: DataTypes.STRING,   // ← changed from DataTypes.INTEGER to DataTypes.STRING
    },
    fishing_boat_name: {
      type: DataTypes.STRING,
    },
    make: {
      type: DataTypes.STRING,
    },
    engine_sn: {
      type: DataTypes.STRING,
    },
    no_of_fisher_man: {
      type: DataTypes.INTEGER,
    },
    or_no: {
      type: DataTypes.INTEGER,
    },
    amount_paid: {
      type: DataTypes.INTEGER,
    },
    date: {
      type: DataTypes.DATE,
    },
    barangay: {                  // New field for filtering by barangay
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    }
  }, {
    tableName: 'boatrecords',
    timestamps: true,
  });

  Boatrecord.associate = function(models) {
    // Define associations here if needed.
  };

  return Boatrecord;
};
