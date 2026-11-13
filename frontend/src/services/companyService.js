import api from './api';

export const companyService = {
  list: () => api.get('/companies').then((r) => r.data),
  update: (id, payload) => api.put(`/companies/${id}`, payload).then((r) => r.data),
};
