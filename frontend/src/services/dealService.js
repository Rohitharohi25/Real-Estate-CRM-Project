import api from './api';

export const dealService = {
  list: (params) => api.get('/deals', { params }).then((r) => r.data),
  get: (id) => api.get(`/deals/${id}`).then((r) => r.data),
  create: (payload) => api.post('/deals', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/deals/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/deals/${id}`).then((r) => r.data),
};
