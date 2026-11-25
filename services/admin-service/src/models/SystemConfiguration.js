const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemConfiguration = sequelize.define('SystemConfiguration', {
  config_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  config_value: {
    type: DataTypes.JSON,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  last_modified_by: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'system_configurations',
  timestamps: true,
  createdAt: false, // Gunakan updated_at saja
  updatedAt: 'updated_at'
});

module.exports = SystemConfiguration;