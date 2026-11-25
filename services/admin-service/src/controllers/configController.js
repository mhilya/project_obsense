const { SystemConfiguration } = require('../models');

// GET /api/configurations
const getConfigurations = async (req, res) => {
  try {
    const configs = await SystemConfiguration.findAll();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/configurations/:config_key (Super Admin only)
const updateConfiguration = async (req, res) => {
  try {
    const { config_key } = req.params;
    const { config_value, description } = req.body;
    const last_modified_by = req.user.name;

    if (!config_value) {
      return res.status(400).json({ error: "config_value wajib diisi" });
    }

    const [updated] = await SystemConfiguration.update(
      { config_value, description, last_modified_by },
      { where: { config_key } }
    );

    if (!updated) {
      return res.status(404).json({ error: "Konfigurasi tidak ditemukan" });
    }

    const config = await SystemConfiguration.findOne({ where: { config_key } });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getConfigurations,
  updateConfiguration
};