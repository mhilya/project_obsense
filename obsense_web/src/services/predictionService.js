import api from './api';

export const predictionService = {
  async getMetadata() {
    const response = await api.get('/predict/metadata');
    return response.data.data;
  },

  async predictDirect(payload) {
    const response = await api.post('/predict', payload);
    return response.data.data;
  },

  async predictFromCycle(payload) {
    const response = await api.post('/assessments/predict', payload);
    return response.data;
  },
};

export default predictionService;
