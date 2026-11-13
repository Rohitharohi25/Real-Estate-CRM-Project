import api from './api';

export const accountService = {
  summary: () => api.get('/account').then((r) => r.data),
  changePlan: (planId) => api.put('/account/plan', { planId }).then((r) => r.data),
};
