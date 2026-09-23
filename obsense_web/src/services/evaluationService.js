import api from './api';

export const evaluationService = {
  async getEvaluations(params = {}) {
    const response = await api.get('/evaluations', { params });
    return response.data.data;
  },

  async createEvaluation(evalData) {
    const response = await api.post('/evaluations', evalData);
    return response.data;
  }
};

export default evaluationService;
