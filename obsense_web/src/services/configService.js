import api from './api';

export const configService = {
  async getConfigurations() {
    const response = await api.get('/configurations');
    return response.data.data;
  },

  async updateConfiguration(key, value) {
    const response = await api.put(`/configurations/${key}`, { value });
    return response.data;
  }
};

export default configService;
