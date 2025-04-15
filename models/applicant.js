'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Applicant extends Model {
    static associate(models) {
      this.hasMany(models.BusinessRecord, { foreignKey: 'applicantId', as: 'businessRecords' });
    }
  }

  Applicant.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    applicantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    applicantAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // New attribute for Nature of Business
    natureOfBusiness: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'Nature of Business', // Maps model attribute to column "Nature of Business"
    },
    capitalInvestment: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Applicant',
    tableName: 'Applicants',
    freezeTableName: true,
  });

  return Applicant;
};
