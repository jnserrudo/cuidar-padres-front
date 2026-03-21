const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('token');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Error de red');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// AUTH
export const authApi = {
  login: (identifier: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ identifier, password }),
    }),
  me: () => request<User>('/auth/me'),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  register: (data: Partial<User> & { password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

// APPLICATIONS
export const applicationsApi = {
  list: (params: Record<string, string | number>) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<PaginatedResponse<Application>>(`/applications?${q}`);
  },
  get: (id: string) => request<Application>(`/applications/${id}`),
  create: (data: Partial<Application>) =>
    request<Application>('/applications', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Application>) =>
    request<Application>(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  bulkUpdate: (ids: string[], status: string, adminNotes?: string) =>
    request<{ updated: number }>('/applications/bulk', {
      method: 'PATCH', body: JSON.stringify({ ids, status, adminNotes }),
    }),
  delete: (id: string) => request(`/applications/${id}`, { method: 'DELETE' }),
};

// LOCATIONS
export const locationsApi = {
  list: () => request<Location[]>('/locations'),
  create: (data: Partial<Location>) =>
    request<Location>('/locations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Location>) =>
    request<Location>(`/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/locations/${id}`, { method: 'DELETE' }),
};

// PRESS
export const pressApi = {
  list: () => request<PressArticle[]>('/press'),
  create: (data: Partial<PressArticle>) =>
    request<PressArticle>('/press', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PressArticle>) =>
    request<PressArticle>(`/press/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/press/${id}`, { method: 'DELETE' }),
};

// WEBINARS
export const webinarsApi = {
  list: () => request<Webinar[]>('/webinars'),
  create: (data: Partial<Webinar>) =>
    request<Webinar>('/webinars', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Webinar>) =>
    request<Webinar>(`/webinars/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/webinars/${id}`, { method: 'DELETE' }),
};

// ANNOUNCEMENTS
export const announcementsApi = {
  list: () => request<Announcement[]>('/announcements'),
  get: (id: string) => request<Announcement>(`/announcements/${id}`),
  create: (data: Partial<Announcement>) =>
    request<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Announcement>) =>
    request<Announcement>(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/announcements/${id}`, { method: 'DELETE' }),
};

// EMAIL TEMPLATES
export const emailTemplatesApi = {
  list: () => request<EmailTemplate[]>('/email-templates'),
  upsert: (data: EmailTemplate) =>
    request<EmailTemplate>('/email-templates', { method: 'POST', body: JSON.stringify(data) }),
};

// USERS
export const usersApi = {
  list: () => request<User[]>('/users'),
  update: (id: string, data: Partial<User> & { password?: string }) =>
    request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),
};

// WHATSAPP GROUPS
export const whatsappGroupsApi = {
  list: () => request<WhatsAppGroup[]>('/whatsapp-groups'),
  get: (id: string) => request<WhatsAppGroupDetail>(`/whatsapp-groups/${id}`),
  create: (data: Partial<WhatsAppGroup>) =>
    request<WhatsAppGroup>('/whatsapp-groups', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<WhatsAppGroup>) =>
    request<WhatsAppGroup>(`/whatsapp-groups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/whatsapp-groups/${id}`, { method: 'DELETE' }),
  assignLocations: (groupId: string, locationIds: string[], priority?: number) =>
    request(`/whatsapp-groups/${groupId}/assign-locations`, {
      method: 'POST',
      body: JSON.stringify({ locationIds, priority })
    }),
  unassignLocation: (groupId: string, locationId: string) =>
    request(`/whatsapp-groups/${groupId}/unassign-location/${locationId}`, { method: 'DELETE' }),
  bulkUpdateUrl: (groupId: string, newUrl: string) =>
    request<BulkUpdateResponse>('/whatsapp-groups/bulk-update-url', {
      method: 'PATCH',
      body: JSON.stringify({ groupId, newUrl })
    }),
  getLocationGroups: (locationId: string) =>
    request<WhatsAppGroup[]>(`/locations/${locationId}/whatsapp-groups`)
};

// TYPES
export interface User {
  id: string; username: string; email: string; role: string;
  nombre: string; apellido: string; zonaAsignada?: string | null;
  createdAt?: string;
}
export interface Application {
  id: string; clientSubmissionId?: string; createdAt: string; status: string;
  nombre: string; apellido: string; dni?: string; email: string; telefono: string;
  provincia?: string; zonaPersonaCuidada?: string; necesidades: string[];
  motivacion?: string; aceptaNormas: boolean; sugerencias?: string;
  adminNotes?: string; riskFlags: string[]; locationId?: string;
  inProgressAt?: string; inProgressBy?: string; reviewedBy?: string;
  approvedAt?: string; rejectedAt?: string; inviteSentAt?: string;
  inviteSentBy?: string; memberJoinedAt?: string;
}
export interface Location {
  id: string; type: string; name: string; description?: string;
  whatsappUrl?: string; isActive: boolean; createdAt: string;
}
export interface PressArticle {
  id: string; title: string; url: string; description: string;
  imageUrl: string; isActive: boolean; createdAt: string;
}
export interface Webinar {
  id: string; createdAt: string; title: string; youtubeUrl: string;
  youtubeId?: string; description?: string; specialGuests?: string; addedBy?: string;
}
export interface Announcement {
  id: string; createdAt: string; title: string; summary?: string;
  body: string; location?: string; addedBy?: string;
}
export interface EmailTemplate {
  id?: string; motivo: string; subject: string; body: string;
}
export interface WhatsAppGroup {
  id: string;
  name: string;
  url: string;
  capacity: number;
  currentSize: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface WhatsAppGroupDetail extends WhatsAppGroup {
  locations: Array<{
    location: Location;
    priority: number;
    assignedAt: string;
    assignedBy?: string;
  }>;
}
export interface BulkUpdateResponse {
  message: string;
  group: WhatsAppGroup;
  affectedLocations: number;
  locations: string[];
}
export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; limit: number; totalPages: number;
}
