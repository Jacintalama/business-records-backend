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
    taxClearance: DataTypes.STRING,
    garbage: DataTypes.STRING,
    verification: DataTypes.STRING,
    weightAndMass: DataTypes.STRING,
    healthClearance: DataTypes.STRING,
    secFee: DataTypes.STRING,
    menro: DataTypes.STRING,
    docTax: DataTypes.STRING,
    eggsFee: DataTypes.STRING,
    market: DataTypes.STRING,
    surcharge25: DataTypes.STRING,
    surcharge5: DataTypes.STRING,
    totalPayment: DataTypes.STRING,
    remarks: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'BusinessRecord',
    tableName: 'BusinessRecords',
    freezeTableName: true,
  });

  return BusinessRecord;
};
