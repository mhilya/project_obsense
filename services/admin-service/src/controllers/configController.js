const { SystemConfiguration } = require('../models');

const AUDIT_URL = () => process.env.AUDIT_SERVICE_URL || 'http://localhost:4006';

const emitAudit = (req, payload) => {
  fetch(`${AUDIT_URL()}/api/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: req.headers.authorization || '',
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
};

// GET /api/configurations
const getConfigurations = async (req, res) => {
  try {
    const configs = await SystemConfiguration.findAll();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/configurations/:config_key (Super Admin only)
const updateConfiguration = async (req, res) => {
  try {
    const { config_key } = req.params;
    const { config_value, description } = req.body;
    const last_modified_by = req.user.name || 'Super Admin';

    if (!config_value) {
      return res.status(400).json({ message: 'config_value wajib diisi.' });
    }

    const existing = await SystemConfiguration.findOne({ where: { config_key } });
    const beforeVal = existing ? existing.config_value : null;

    if (existing) {
      await SystemConfiguration.update(
        { config_value, ...(description !== undefined ? { description } : {}), last_modified_by },
        { where: { config_key } }
      );
    } else {
      await SystemConfiguration.create({
        config_key,
        config_value,
        description: description || config_key,
        last_modified_by,
      });
    }

    const config = await SystemConfiguration.findOne({ where: { config_key } });

    emitAudit(req, {
      action: 'UPDATE_CONFIG',
      entity_type: 'Config',
      entity_id: config_key,
      details: { before: beforeVal, after: config_value },
    });

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConfigurations, updateConfiguration };
