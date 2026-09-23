import api from './api';

export const assessmentService = {
  async getAssessments(params = {}) {
    const response = await api.get('/assessments', { params });
    return response.data.data;
  },

  async getAssessmentById(id) {
    const response = await api.get(`/assessments/${id}`);
    return response.data.data;
  },

  async createAssessment(assessmentData) {
    const response = await api.post('/assessments', assessmentData);
    return response.data;
  }
};

export default assessmentService;
