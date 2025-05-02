'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MayorPermit extends Model {
    static associate(models) {
      // This is the inverse of BusinessRecord.belongsToMany(… as: 'permits')
      this.belongsToMany(models.BusinessRecord, {
        through: models.BusinessRecordPermit,
        foreignKey: 'mayorPermitId',
        otherKey:  'businessRecordId',
        as:       'businessRecords'
      });
    }
  }

  MayorPermit.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MayorPermit',
    tableName:  'MayorPermits',
    freezeTableName: true,
  });

  return MayorPermit;
};
