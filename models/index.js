'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, '/../config/config.json');
const config = require(configPath)[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Existing User ↔ BusinessRecord
if (db.User && db.BusinessRecord) {
  db.User.hasMany(db.BusinessRecord, { foreignKey: 'userId', as: 'businessRecords' });
  db.BusinessRecord.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
}

// Existing Applicant ↔ BusinessRecord
if (db.Applicant && db.BusinessRecord) {
  db.Applicant.hasMany(db.BusinessRecord, { foreignKey: 'applicantId', as: 'businessRecords' });
  db.BusinessRecord.belongsTo(db.Applicant, { foreignKey: 'applicantId', as: 'applicant' });
}

// ─── New MP associations ─────────────────────────────────────────────
// BusinessRecord ↔ MayorPermit (through BusinessRecordPermit)
if (db.BusinessRecord && db.MayorPermit && db.BusinessRecordPermit) {
  db.BusinessRecord.belongsToMany(db.MayorPermit, {
    through: db.BusinessRecordPermit,
    foreignKey: 'businessRecordId',
    otherKey:   'mayorPermitId',
    as:        'permits'
  });

  db.MayorPermit.belongsToMany(db.BusinessRecord, {
    through: db.BusinessRecordPermit,
    foreignKey: 'mayorPermitId',
    otherKey:   'businessRecordId',
    as:        'businessRecords'
  });

  // Also allow direct eager‑loading of the join model if needed
  db.BusinessRecordPermit.belongsTo(db.BusinessRecord, {
    foreignKey: 'businessRecordId',
    onDelete:  'CASCADE'
  });
  db.BusinessRecordPermit.belongsTo(db.MayorPermit, {
    foreignKey: 'mayorPermitId',
    onDelete:  'RESTRICT'
  });
}
// ────────────────────────────────────────────────────────────────────

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
