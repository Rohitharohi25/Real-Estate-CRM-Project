import api from './api';

export const noteService = {
  list: (params) => api.get('/notes', { params }).then((r) => r.data),
  create: (payload) => api.post('/notes', payload).then((r) => r.data),
  remove: (id) => api.delete(`/notes/${id}`).then((r) => r.data),
};
