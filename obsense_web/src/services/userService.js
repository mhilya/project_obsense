import api from './api';
import assessmentService from './assessmentService';

export const apiErrorMessage = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response) return `Server error (${err.response.status})`;
  return 'Tidak dapat terhubung ke server. Pastikan gateway & service berjalan.';
};

export const userService = {
  async getUsers(params = {}) {
    const queryParams = { ...params };
    if (queryParams.includeDeleted !== undefined) {
      queryParams.includeDeleted = String(Boolean(queryParams.includeDeleted));
    }
    const response = await api.get('/users', { params: queryParams });
    return response.data.data || [];
  },

  // Gabungkan profil pasien (user-service) dengan hasil asesmen terbaru (assessment-service)
  async getUsersWithLatest(params = {}) {
    const [users, assessments] = await Promise.all([
      this.getUsers(params),
      assessmentService.getAssessments().catch(() => []),
    ]);

    const latestByUser = {};
    assessments.forEach((a) => {
      if (!latestByUser[a.user_id]) {
        latestByUser[a.user_id] = a;
      }
    });

    return users.map((u) => {
      const latest = latestByUser[u.id];
      if (!latest) return u;
      return {
        ...u,
        obesity_class: latest.obesity_class || u.obesity_class,
        risk_level: latest.risk_level || u.risk_level,
        latest_assessment_id: latest.id,
        latest_assessment_date: latest.assessment_date,
      };
    });
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async restoreUser(id) {
    const response = await api.post(`/users/${id}/restore`);
    return response.data;
  },
};

export default userService;
