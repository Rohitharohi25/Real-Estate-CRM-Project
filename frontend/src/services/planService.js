import api from './api';

export const planService = {
  publicList: () => api.get('/plans/public').then((r) => r.data),
  list: (params) => api.get('/plans', { params }).then((r) => r.data),
  create: (payload) => api.post('/plans', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/plans/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/plans/${id}`).then((r) => r.data),
};
