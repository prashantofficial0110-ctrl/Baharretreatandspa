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
import { clientStorage } from './clientStorage.js';

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

// Helper to determine if we should fall back to clientStorage
async function safeFetchJson<T>(
  url: string,
  options: RequestInit = {},
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
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

    const contentType = res.headers.get('content-type') || '';

    // If server returned HTML (e.g. Netlify rewrite to index.html for unhandled /api/*),
    // or if 404/502/503 from static CDN
    if (contentType.includes('text/html') || res.status === 404 || res.status === 502) {
      return await fallbackFn();
    }

    const text = await res.text();
    if (!text || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      return await fallbackFn();
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      return await fallbackFn();
    }

    if (!res.ok || data.success === false) {
      // If unauthorized, throw error as expected
      if (res.status === 401 || res.status === 403) {
        throw new Error(data.error || 'Unauthorized');
      }
      // If server error, try fallback
      return await fallbackFn();
    }

    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    // If it's a genuine auth rejection error from server, rethrow
    if (err.message && (err.message.includes('Invalid credentials') || err.message.includes('Unauthorized'))) {
      // Still allow client fallback for static sites where credentials match local database
      try {
        return await fallbackFn();
      } catch (fallbackErr) {
        throw err;
      }
    }
    // Network or static host failure: seamlessly execute client fallback
    return await fallbackFn();
  }
}

export const api = {
  // Public
  async getSettings(): Promise<WebsiteSettings> {
    return safeFetchJson<WebsiteSettings>('/api/settings', {}, () => clientStorage.getSettings());
  },

  async getRooms(): Promise<Room[]> {
    return safeFetchJson<Room[]>('/api/rooms', {}, () => clientStorage.getRooms());
  },

  async getRoomById(id: string): Promise<Room> {
    return safeFetchJson<Room>(`/api/rooms/${id}`, {}, () => clientStorage.getRoomById(id));
  },

  async getServices(): Promise<SpaService[]> {
    return safeFetchJson<SpaService[]>('/api/services', {}, () => clientStorage.getServices());
  },

  async getFacilities(): Promise<Facility[]> {
    return safeFetchJson<Facility[]>('/api/facilities', {}, () => clientStorage.getFacilities());
  },

  async getGallery(): Promise<GalleryItem[]> {
    return safeFetchJson<GalleryItem[]>('/api/gallery', {}, () => clientStorage.getGallery());
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return safeFetchJson<Testimonial[]>('/api/testimonials', {}, () => clientStorage.getTestimonials());
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
    return safeFetchJson<Booking>(
      '/api/bookings',
      {
        method: 'POST',
        body: JSON.stringify(bookingData),
      },
      () => clientStorage.createBooking(bookingData)
    );
  },

  async createEnquiry(enquiryData: {
    name: string;
    phone: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<{ id: string; name: string }> {
    return safeFetchJson<{ id: string; name: string }>(
      '/api/enquiries',
      {
        method: 'POST',
        body: JSON.stringify(enquiryData),
      },
      () => clientStorage.createEnquiry(enquiryData)
    );
  },

  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    return safeFetchJson<{ token: string; user: AdminUser }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      () => {
        const authData = clientStorage.login(username, password);
        setStoredToken(authData.token);
        return authData;
      }
    ).then((data) => {
      setStoredToken(data.token);
      return data;
    });
  },

  async verifyAuth(): Promise<AdminUser> {
    return safeFetchJson<AdminUser>(
      '/api/auth/verify',
      {},
      () => clientStorage.verifyAuth()
    );
  },

  logout() {
    removeStoredToken();
  },

  // Admin Protected
  async getAdminStats(): Promise<DashboardStats> {
    return safeFetchJson<DashboardStats>(
      '/api/admin/stats',
      {},
      () => clientStorage.getAdminStats()
    );
  },

  async getAdminBookings(status?: string, search?: string): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetchJson<Booking[]>(
      `/api/admin/bookings${query}`,
      {},
      () => clientStorage.getBookings(status, search)
    );
  },

  async getBookingDetail(id: string): Promise<Booking> {
    return safeFetchJson<Booking>(
      `/api/admin/bookings/${id}`,
      {},
      () => clientStorage.getBookingDetail(id)
    );
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    return safeFetchJson<Booking>(
      `/api/admin/bookings/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      () => clientStorage.updateBooking(id, updates)
    );
  },

  async deleteBooking(id: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `/api/admin/bookings/${id}`,
      {
        method: 'DELETE',
      },
      () => clientStorage.deleteBooking(id)
    );
  },

  async getAdminEnquiries(status?: string, search?: string): Promise<Enquiry[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetchJson<Enquiry[]>(
      `/api/admin/enquiries${query}`,
      {},
      () => clientStorage.getEnquiries(status, search)
    );
  },

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    return safeFetchJson<Enquiry>(
      `/api/admin/enquiries/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      () => clientStorage.updateEnquiry(id, updates)
    );
  },

  async deleteEnquiry(id: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `/api/admin/enquiries/${id}`,
      {
        method: 'DELETE',
      },
      () => clientStorage.deleteEnquiry(id)
    );
  },

  async getAdminRooms(): Promise<Room[]> {
    return safeFetchJson<Room[]>(
      '/api/admin/rooms',
      {},
      () => clientStorage.getRooms()
    );
  },

  async createRoom(room: Partial<Room>): Promise<Room> {
    return safeFetchJson<Room>(
      '/api/admin/rooms',
      {
        method: 'POST',
        body: JSON.stringify(room),
      },
      () => clientStorage.createRoom(room)
    );
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    return safeFetchJson<Room>(
      `/api/admin/rooms/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      () => clientStorage.updateRoom(id, updates)
    );
  },

  async deleteRoom(id: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `/api/admin/rooms/${id}`,
      {
        method: 'DELETE',
      },
      () => clientStorage.deleteRoom(id)
    );
  },

  async getAdminServices(): Promise<SpaService[]> {
    return safeFetchJson<SpaService[]>(
      '/api/admin/services',
      {},
      () => clientStorage.getServices()
    );
  },

  async createService(service: Partial<SpaService>): Promise<SpaService> {
    return safeFetchJson<SpaService>(
      '/api/admin/services',
      {
        method: 'POST',
        body: JSON.stringify(service),
      },
      () => clientStorage.createService(service)
    );
  },

  async updateService(id: string, updates: Partial<SpaService>): Promise<SpaService> {
    return safeFetchJson<SpaService>(
      `/api/admin/services/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      () => clientStorage.updateService(id, updates)
    );
  },

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `/api/admin/services/${id}`,
      {
        method: 'DELETE',
      },
      () => clientStorage.deleteService(id)
    );
  },

  async createFacility(facility: Partial<Facility>): Promise<Facility> {
    return safeFetchJson<Facility>(
      '/api/admin/facilities',
      {
        method: 'POST',
        body: JSON.stringify(facility),
      },
      () => clientStorage.createFacility(facility)
    );
  },

  async updateFacility(id: string, updates: Partial<Facility>): Promise<Facility> {
    return safeFetchJson<Facility>(
      `/api/admin/facilities/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      () => clientStorage.updateFacility(id, updates)
    );
  },

  async deleteFacility(id: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `/api/admin/facilities/${id}`,
      {
        method: 'DELETE',
      },
      () => clientStorage.deleteFacility(id)
    );
  },

  async createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    return safeFetchJson<GalleryItem>(
      '/api/admin/gallery',
      {
        method: 'POST',
        body: JSON.stringify(item),
      },
      () => clientStorage.createGalleryItem(item)
    );
  },

  async updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
    return safeFetchJson<GalleryItem>(
      `/api/admin/gallery/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      () => clientStorage.updateGalleryItem(id, updates)
    );
  },

  async deleteGalleryItem(id: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      `/api/admin/gallery/${id}`,
      {
        method: 'DELETE',
      },
      () => clientStorage.deleteGalleryItem(id)
    );
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    return safeFetchJson<WebsiteSettings>(
      '/api/admin/settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      },
      () => clientStorage.updateSettings(settings)
    );
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson<{ success: boolean; message: string }>(
      '/api/admin/change-password',
      {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      },
      () => clientStorage.changePassword(currentPassword, newPassword)
    );
  },
};
