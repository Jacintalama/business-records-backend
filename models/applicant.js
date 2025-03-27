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
