'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BusinessRecord extends Model {
    static associate(models) {
      // Remove or comment out the association
      // BusinessRecord.belongsTo(models.Barangay, { foreignKey: 'barangayId', as: 'barangay' });
    }
  }
  BusinessRecord.init(
    {
      applicantName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      applicantAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      businessName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      capitalInvestment: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      gross: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      orNo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      busTax: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      mayorsPermit: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      sanitaryInps: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      policeClearance: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      taxClearance: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      garbage: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      verification: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      weightAndMass: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      healthClearance: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      secFee: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      menro: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      docTax: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      eggsFee: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      market: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      surcharge25: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      surcharge5: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      totalPayment: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
    
    },
    {
      sequelize,
      modelName: 'BusinessRecord',
      tableName: 'BusinessRecords'
    }
  );
  return BusinessRecord;
};
