import api from './api';

export const evaluationService = {
  async getEvaluations(params = {}) {
    const response = await api.get('/evaluations', { params });
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  async createEvaluation(payload) {
    const response = await api.post('/evaluations', payload);
    return response.data;
  },
};

export default evaluationService;
