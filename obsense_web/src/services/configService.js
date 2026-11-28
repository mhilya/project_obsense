import api from './api';
import { INITIAL_CONFIGURATIONS } from '../mock/mockData';

// Normalisasi format threshold_who_bmi (mendukung format flat maupun nested lama)
const normalizeBmiThreshold = (val) => {
  if (!val || typeof val !== 'object') return { ...INITIAL_CONFIGURATIONS.threshold_who_bmi };
  if (val.normal_weight_min !== undefined) return val;
  return {
    insufficient_weight: val.underweight ?? 18.5,
    normal_weight_min: val.normal?.min ?? 18.5,
    normal_weight_max: val.normal?.max ?? 24.9,
    overweight_min: val.overweight?.min ?? 25.0,
    overweight_max: val.overweight?.max ?? 29.9,
    obesity_1_min: val.obesity_1?.min ?? 30.0,
    obesity_1_max: val.obesity_1?.max ?? 34.9,
    obesity_2_min: val.obesity_2?.min ?? 35.0,
    obesity_2_max: val.obesity_2?.max ?? 39.9,
    obesity_3_min: val.obesity_3?.min ?? 40.0,
  };
};

export const configService = {
  async getConfigurations() {
    const response = await api.get('/configurations');
    const rows = Array.isArray(response.data) ? response.data : response.data.data || [];

    const byKey = {};
    let latestBy = 'System';
    let latestAt = '-';

    rows.forEach((row) => {
      const parsed = typeof row.config_value === 'string' ? JSON.parse(row.config_value) : row.config_value;
      byKey[row.config_key] = parsed;
      const ts = row.updated_at || row.updatedAt;
      if (ts && (latestAt === '-' || String(ts) > String(latestAt))) {
        latestAt = String(ts);
        latestBy = row.last_modified_by || 'System';
      }
    });

    return {
      threshold_who_bmi: normalizeBmiThreshold(byKey.threshold_who_bmi),
      variable_mappings: byKey.variable_mappings || INITIAL_CONFIGURATIONS.variable_mappings,
      ffq_window: byKey.ffq_window || INITIAL_CONFIGURATIONS.ffq_window,
      audit_info: {
        last_modified_by: latestBy,
        last_modified_at: latestAt !== '-' ? new Date(latestAt).toLocaleString('id-ID') : '-',
      },
    };
  },

  async updateConfigurations(config) {
    await Promise.all([
      api.put('/configurations/threshold_who_bmi', { config_value: config.threshold_who_bmi }),
      api.put('/configurations/variable_mappings', { config_value: config.variable_mappings }),
      api.put('/configurations/ffq_window', { config_value: config.ffq_window }),
    ]);
    return this.getConfigurations();
  },

  async resetDefaults() {
    return this.updateConfigurations(INITIAL_CONFIGURATIONS);
  },
};

export default configService;
