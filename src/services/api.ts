import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export { API_BASE_URL } from '../config'; // URL managed by start-dev.ps1
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // bypass ngrok interstitial page
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Guard against ngrok interstitial HTML responses crashing JSON.parse
api.interceptors.response.use(
  (response) => {
    const ct = response.headers?.['content-type'] || '';
    if (ct.includes('text/html')) {
      return Promise.reject(new Error('Received HTML instead of JSON — ngrok tunnel may not be running'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  googleLogin: (idToken: string) => api.post('/auth/google', { idToken }),
  getProfile: () => api.get('/auth/profile'),
};

export const incidentService = {
  getIncidents: () => api.get('/incidents'),
  getIncidentById: (id: string) => api.get(`/incidents/${id}`),
  createIncident: (data: any) => api.post('/incidents', data),
  updateStatus: (id: string, status: string) => api.patch(`/incidents/${id}/status`, { status }),
  deleteIncident: (id: string) => api.delete(`/incidents/${id}`),
  report: (data: any) => api.post('/incidents', data),
  getMyReports: () => api.get('/incidents/my'),
  getAll: () => api.get('/incidents/all'),
};

export const alertService = {
  createAlert: (data: any) => api.post('/alerts', data),
  getAlerts: (params?: { lat?: number; lng?: number }) => api.get('/alerts', { params }),
  deactivateAlert: (id: string) => api.patch(`/alerts/${id}/deactivate`),
  deleteAlert: (id: string) => api.delete(`/alerts/${id}`),
};

export const campService = {
  getCamps: () => api.get('/camps'),
  createCamp: (data: any) => api.post('/camps', data),
};

export const userService = {
  getUsers: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const resourceService = {
  getResources: () => api.get('/resources'),
  createResource: (data: any) => api.post('/resources', data),
  updateStatus: (id: string, status: string) => api.patch(`/resources/${id}/status`, { status }),
};

export const tokenService = {
  getTokens: () => api.get('/tokens'),
  createToken: (data: any) => api.post('/tokens', data),
  useToken: (code: string) => api.post('/tokens/use', { code }),
};

export const volunteerService = {
  upsertProfile: (data: any) => api.post('/volunteers/profile', data),
  getProfile: () => api.get('/volunteers/profile'),
  getMyTasks: () => api.get('/volunteers/tasks/my'),
  updateTaskStatus: (taskId: string, status: string) => api.patch(`/volunteers/tasks/${taskId}/status`, { status }),
};

export const helpRequestService = {
  createRequest: (data: any) => api.post('/help-requests', data),
  getRequests: () => api.get('/help-requests'),
  registerVerifier: (data: any) => api.post('/help-requests/verifier/register', data),
  verifyAction: (data: any) => api.post('/help-requests/verifier/verify', data),
};

export const reliefTokenService = {
  getMyTokens: () => api.get('/relief-tokens/my'),
  issueToken: (data: any) => api.post('/relief-tokens/issue', data),
  claimToken: (data: any) => api.post('/relief-tokens/claim', data),
  recordDistribution: (data: any) => api.post('/relief-tokens/distribution', data),
};

export const damageAssessmentService = {
  reportDamage: (data: any) => api.post('/assessments/damage', data),
  getAssessments: () => api.get('/assessments/damage'),
};

export const missingPersonService = {
  report: (data: any) => api.post('/missing-persons', data),
  reportMissing: (data: any) => api.post('/missing-persons', data),
  getMissing: () => api.get('/missing-persons'),
  updateStatus: (id: string, status: string) => api.patch(`/missing-persons/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/missing-persons/${id}`),
};

export const supportService = {
  createRequest: (data: any) => api.post('/support', data),
  getRequests: () => api.get('/support'),
  updateStatus: (id: string, data: any) => api.patch(`/support/${id}/status`, data),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const analyticsService = {
  getOperationalIntelligence: () => api.get('/analytics/operational-intelligence'),
};

export const auditService = {
  getLogs: () => api.get('/audit'),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications/my'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

export const locationService = {
  logLocation: (data: any) => api.post('/location/log', data),
  getUserLocation: (userId: string) => api.get(`/location/user/${userId}`),
};

export const donateService = {
  submitDonation: (data: any) => api.post('/donations', data),
};

export const sosService = {
  trigger: (data: { latitude: number | null; longitude: number | null }) =>
    api.post('/incidents/sos', data),
};

export const supplyRequestService = {
  createRequest: (data: any) => api.post('/supply-requests', data),
  getMyRequests: () => api.get('/supply-requests/my'),
};

export const familyService = {
  reportStatus: (data: any) => api.post('/family/status', data),
  getMyStatus: () => api.get('/family/my-status'),
  addMember: (data: any) => api.post('/family/members', data),
  updateMember: (id: string, data: any) => api.patch(`/family/members/${id}`, data),
};

export const safeZoneService = {
  /** Fetch public safe places near a coordinate. dangerRadius=0 returns raw places; compute danger per-alert client-side. */
  getNearby: (lat: number, lng: number, searchRadiusKm = 5, maxResults = 25) =>
    api.get('/safe-zones', { params: { lat, lng, dangerRadius: 0, searchRadius: searchRadiusKm, maxResults } }),
};

export const waterService = {
  getRiverLevels: () => api.get('/water/river'),
  getRainfallData: () => api.get('/water/rainfall'),
  getPredictions: () => api.get('/water/predictions'),
};

export default api;

