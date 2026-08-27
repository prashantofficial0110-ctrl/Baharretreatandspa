import {
  WebsiteSettings,
  Room,
  SpaService,
  Facility,
  GalleryItem,
  Testimonial,
  Booking,
  Enquiry,
  AdminUser,
  DashboardStats,
} from '../types.js';

const TOKEN_KEY = 'bahar_admin_jwt';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Network request failed');
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Public
  async getSettings(): Promise<WebsiteSettings> {
    return fetchJson<WebsiteSettings>('/api/settings');
  },

  async getRooms(): Promise<Room[]> {
    return fetchJson<Room[]>('/api/rooms');
  },

  async getRoomById(id: string): Promise<Room> {
    return fetchJson<Room>(`/api/rooms/${id}`);
  },

  async getServices(): Promise<SpaService[]> {
    return fetchJson<SpaService[]>('/api/services');
  },

  async getFacilities(): Promise<Facility[]> {
    return fetchJson<Facility[]>('/api/facilities');
  },

  async getGallery(): Promise<GalleryItem[]> {
    return fetchJson<GalleryItem[]>('/api/gallery');
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return fetchJson<Testimonial[]>('/api/testimonials');
  },

  async createBooking(bookingData: {
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    roomId?: string;
    serviceId?: string;
    specialRequests?: string;
    source?: string;
  }): Promise<Booking> {
    return fetchJson<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async createEnquiry(enquiryData: {
    name: string;
    phone: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<{ id: string; name: string }> {
    return fetchJson('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });
  },

  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const data = await fetchJson<{ token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async verifyAuth(): Promise<AdminUser> {
    return fetchJson<AdminUser>('/api/auth/verify');
  },

  logout() {
    removeStoredToken();
  },

  // Admin Protected
  async getAdminStats(): Promise<DashboardStats> {
    return fetchJson<DashboardStats>('/api/admin/stats');
  },

  async getAdminBookings(status?: string, search?: string): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Booking[]>(`/api/admin/bookings${query}`);
  },

  async getBookingDetail(id: string): Promise<Booking> {
    return fetchJson<Booking>(`/api/admin/bookings/${id}`);
  },

  // Critical feature: Owner editing submitted booking details
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    return fetchJson<Booking>(`/api/admin/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteBooking(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminEnquiries(status?: string, search?: string): Promise<Enquiry[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Enquiry[]>(`/api/admin/enquiries${query}`);
  },

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    return fetchJson<Enquiry>(`/api/admin/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteEnquiry(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/admin/enquiries/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminRooms(): Promise<Room[]> {
    return fetchJson<Room[]>('/api/admin/rooms');
  },

  async createRoom(room: Partial<Room>): Promise<Room> {
    return fetchJson<Room>('/api/admin/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    });
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    return fetchJson<Room>(`/api/admin/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteRoom(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/admin/rooms/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminServices(): Promise<SpaService[]> {
    return fetchJson<SpaService[]>('/api/admin/services');
  },

  async createService(service: Partial<SpaService>): Promise<SpaService> {
    return fetchJson<SpaService>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },

  async updateService(id: string, updates: Partial<SpaService>): Promise<SpaService> {
    return fetchJson<SpaService>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/admin/services/${id}`, {
      method: 'DELETE',
    });
  },

  async createFacility(facility: Partial<Facility>): Promise<Facility> {
    return fetchJson<Facility>('/api/admin/facilities', {
      method: 'POST',
      body: JSON.stringify(facility),
    });
  },

  async updateFacility(id: string, updates: Partial<Facility>): Promise<Facility> {
    return fetchJson<Facility>(`/api/admin/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteFacility(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/admin/facilities/${id}`, {
      method: 'DELETE',
    });
  },

  async createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    return fetchJson<GalleryItem>('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
    return fetchJson<GalleryItem>(`/api/admin/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteGalleryItem(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    return fetchJson<WebsiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
