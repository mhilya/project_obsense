const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminEvaluation = sequelize.define('AdminEvaluation', {
  assessment_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admin_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admin_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  evaluation_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  clinical_recommendation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adjusted_risk_level: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'admin_evaluations',
  timestamps: true,
  paranoid: false, // Non-append-only: gunakan true jika butuh soft delete
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AdminEvaluation;