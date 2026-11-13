import api from './api';

export const leadService = {
  list: (params) => api.get('/leads', { params }).then((r) => r.data),
  get: (id) => api.get(`/leads/${id}`).then((r) => r.data),
  create: (payload) => api.post('/leads', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/leads/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/leads/${id}`).then((r) => r.data),
  convert: (id) => api.post(`/leads/${id}/convert`).then((r) => r.data),
};
