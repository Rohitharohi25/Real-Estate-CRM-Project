import api from './api';

export const reportService = {
  dashboard: () => api.get('/reports/dashboard').then((r) => r.data),
  sales: () => api.get('/reports/sales').then((r) => r.data),
  leads: () => api.get('/reports/leads').then((r) => r.data),
};
