'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BusinessRecordPermit extends Model {
    static associate(models) {
      // so you can eager‑load the join rows too, if needed
      this.belongsTo(models.BusinessRecord, {
        foreignKey: 'businessRecordId',
        onDelete:  'CASCADE'
      });
      this.belongsTo(models.MayorPermit, {
        foreignKey: 'mayorPermitId',
        onDelete:  'RESTRICT'
      });
    }
  }

  BusinessRecordPermit.init({
    businessRecordId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    mayorPermitId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'BusinessRecordPermit',
    tableName:  'BusinessRecordPermits',
    freezeTableName: true,
  });

  return BusinessRecordPermit;
};
