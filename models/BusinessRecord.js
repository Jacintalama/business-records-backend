'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BusinessRecord extends Model {
    static associate(models) {
      // BusinessRecord belongs to an Applicant
      this.belongsTo(models.Applicant, { foreignKey: 'applicantId', as: 'applicant' });
    }
  }

  BusinessRecord.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    applicantId: DataTypes.UUID,
    year: DataTypes.INTEGER,
    date: DataTypes.DATE,
    gross: DataTypes.STRING,
    orNo: DataTypes.STRING,
    busTax: DataTypes.STRING,
    mayorsPermit: DataTypes.STRING,
    sanitaryInps: DataTypes.STRING,
    policeClearance: DataTypes.STRING,
    barangayClearance: DataTypes.STRING, // NEW FIELD retained
    zoningClearance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxClearance: DataTypes.STRING,
    garbage: DataTypes.STRING,
    garbageCollection: DataTypes.STRING,
    polluters: DataTypes.STRING,
    Occupation: DataTypes.STRING,
    verification: DataTypes.STRING,
    weightAndMass: DataTypes.STRING,
    healthClearance: DataTypes.STRING,
    secFee: DataTypes.STRING,
    menro: DataTypes.STRING,
    docTax: DataTypes.STRING,
    eggsFee: DataTypes.STRING,
    marketCertification: DataTypes.STRING,
    surcharge25: DataTypes.STRING,
    sucharge2: DataTypes.STRING,
    miscellaneous: DataTypes.STRING,
    totalPayment: DataTypes.STRING,
    remarks: DataTypes.STRING,
    Other: { // Newly added field in the model
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM('quarterly', 'semi-annual', 'annual'),
      allowNull: false,
      defaultValue: 'annual'
    },
    renewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'BusinessRecord',
    tableName: 'BusinessRecords',
    freezeTableName: true,
  });

  return BusinessRecord;
};
