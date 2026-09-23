import api from './api';

export const auditService = {
  async getAuditLogs(params = {}) {
    const response = await api.get('/audit-logs', { params });
    return response.data.data;
  },

  async createAuditLog(logData) {
    const response = await api.post('/audit-logs', logData);
    return response.data;
  }
};

export default auditService;
