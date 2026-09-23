import api from './api';

export const adminService = {
  async getAdmins() {
    const response = await api.get('/admins');
    return response.data.data;
  },

  async createAdmin(adminData) {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  async updateAdmin(id, adminData) {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  async deleteAdmin(id) {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  }
};

export default adminService;
