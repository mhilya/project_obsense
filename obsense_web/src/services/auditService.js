import api from './api';

export const auditService = {
  async getAuditLogs(params = {}) {
    const response = await api.get('/audit', { params });
    return response.data.data || [];
  },

  record(payload) {
    return api.post('/audit', payload).catch(() => {});
  },
};

export default auditService;
