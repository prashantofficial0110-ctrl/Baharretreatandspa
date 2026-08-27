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
import {
  initialSettings,
  initialRooms,
  initialServices,
  initialFacilities,
  initialGallery,
  initialTestimonials,
  initialBookings,
  initialEnquiries,
  initialAdminUser,
} from '../data/initialData.js';

const STORAGE_PREFIX = 'bahar_storage_';
const KEYS = {
  SETTINGS: `${STORAGE_PREFIX}settings`,
  ROOMS: `${STORAGE_PREFIX}rooms`,
  SERVICES: `${STORAGE_PREFIX}services`,
  FACILITIES: `${STORAGE_PREFIX}facilities`,
  GALLERY: `${STORAGE_PREFIX}gallery`,
  TESTIMONIALS: `${STORAGE_PREFIX}testimonials`,
  BOOKINGS: `${STORAGE_PREFIX}bookings`,
  ENQUIRIES: `${STORAGE_PREFIX}enquiries`,
  ADMIN_PASSWORD: `${STORAGE_PREFIX}admin_password`,
  TOKEN: 'bahar_admin_jwt',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse stored item ${key}`, e);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save item ${key}`, e);
  }
}

// Generate short random ID
function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

export const clientStorage = {
  // --- Settings ---
  getSettings(): WebsiteSettings {
    const stored = getLocal<WebsiteSettings | null>(KEYS.SETTINGS, null);
    if (!stored) {
      setLocal(KEYS.SETTINGS, initialSettings);
      return initialSettings;
    }
    return { ...initialSettings, ...stored };
  },

  updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    const current = clientStorage.getSettings();
    const updated = { ...current, ...updates };
    setLocal(KEYS.SETTINGS, updated);
    return updated;
  },

  // --- Rooms ---
  getRooms(): Room[] {
    const rooms = getLocal<Room[]>(KEYS.ROOMS, []);
    if (!rooms || rooms.length === 0) {
      setLocal(KEYS.ROOMS, initialRooms);
      return initialRooms;
    }
    return rooms;
  },

  getRoomById(id: string): Room {
    const rooms = clientStorage.getRooms();
    const found = rooms.find((r) => r.id === id || r.slug === id);
    if (!found) throw new Error('Room not found');
    return found;
  },

  createRoom(roomData: Partial<Room>): Room {
    const rooms = clientStorage.getRooms();
    const newRoom: Room = {
      id: genId('room'),
      name: roomData.name || 'New Room',
      hindiName: roomData.hindiName,
      slug: roomData.slug || (roomData.name || 'room').toLowerCase().replace(/\s+/g, '-'),
      tagline: roomData.tagline || '',
      description: roomData.description || '',
      pricePerNight: Number(roomData.pricePerNight) || 5000,
      capacityAdults: Number(roomData.capacityAdults) || 2,
      capacityChildren: Number(roomData.capacityChildren) || 0,
      bedType: roomData.bedType || 'King Bed',
      sizeSqFt: Number(roomData.sizeSqFt) || 400,
      featuredImage:
        roomData.featuredImage ||
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      galleryImages: roomData.galleryImages || [
        roomData.featuredImage ||
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      ],
      amenities: roomData.amenities || ['Wi-Fi', 'Room Service'],
      isAvailable: roomData.isAvailable !== false,
      isActive: roomData.isActive !== false,
      order: rooms.length + 1,
      createdAt: new Date().toISOString(),
    };
    rooms.push(newRoom);
    setLocal(KEYS.ROOMS, rooms);
    return newRoom;
  },

  updateRoom(id: string, updates: Partial<Room>): Room {
    const rooms = clientStorage.getRooms();
    const index = rooms.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Room not found');
    const updated = { ...rooms[index], ...updates };
    rooms[index] = updated;
    setLocal(KEYS.ROOMS, rooms);
    return updated;
  },

  deleteRoom(id: string): { success: boolean; message: string } {
    let rooms = clientStorage.getRooms();
    rooms = rooms.filter((r) => r.id !== id);
    setLocal(KEYS.ROOMS, rooms);
    return { success: true, message: 'Room deleted' };
  },

  // --- Services ---
  getServices(): SpaService[] {
    const services = getLocal<SpaService[]>(KEYS.SERVICES, []);
    if (!services || services.length === 0) {
      setLocal(KEYS.SERVICES, initialServices);
      return initialServices;
    }
    return services;
  },

  createService(serviceData: Partial<SpaService>): SpaService {
    const services = clientStorage.getServices();
    const newService: SpaService = {
      id: genId('service'),
      name: serviceData.name || 'New Spa Service',
      hindiName: serviceData.hindiName,
      category: serviceData.category || 'Ayurveda',
      durationMinutes: Number(serviceData.durationMinutes) || 60,
      price: Number(serviceData.price) || 3000,
      description: serviceData.description || '',
      benefits: serviceData.benefits || [],
      featuredImage:
        serviceData.featuredImage ||
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
      isActive: serviceData.isActive !== false,
      order: services.length + 1,
      createdAt: new Date().toISOString(),
    };
    services.push(newService);
    setLocal(KEYS.SERVICES, services);
    return newService;
  },

  updateService(id: string, updates: Partial<SpaService>): SpaService {
    const services = clientStorage.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service not found');
    const updated = { ...services[index], ...updates };
    services[index] = updated;
    setLocal(KEYS.SERVICES, services);
    return updated;
  },

  deleteService(id: string): { success: boolean; message: string } {
    let services = clientStorage.getServices();
    services = services.filter((s) => s.id !== id);
    setLocal(KEYS.SERVICES, services);
    return { success: true, message: 'Service deleted' };
  },

  // --- Facilities ---
  getFacilities(): Facility[] {
    const facilities = getLocal<Facility[]>(KEYS.FACILITIES, []);
    if (!facilities || facilities.length === 0) {
      setLocal(KEYS.FACILITIES, initialFacilities);
      return initialFacilities;
    }
    return facilities;
  },

  createFacility(facilityData: Partial<Facility>): Facility {
    const facilities = clientStorage.getFacilities();
    const newFacility: Facility = {
      id: genId('fac'),
      name: facilityData.name || 'New Facility',
      hindiName: facilityData.hindiName,
      iconName: facilityData.iconName || 'Sparkles',
      description: facilityData.description || '',
      image:
        facilityData.image ||
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      isActive: facilityData.isActive !== false,
      order: facilities.length + 1,
    };
    facilities.push(newFacility);
    setLocal(KEYS.FACILITIES, facilities);
    return newFacility;
  },

  updateFacility(id: string, updates: Partial<Facility>): Facility {
    const facilities = clientStorage.getFacilities();
    const index = facilities.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Facility not found');
    const updated = { ...facilities[index], ...updates };
    facilities[index] = updated;
    setLocal(KEYS.FACILITIES, facilities);
    return updated;
  },

  deleteFacility(id: string): { success: boolean; message: string } {
    let facilities = clientStorage.getFacilities();
    facilities = facilities.filter((f) => f.id !== id);
    setLocal(KEYS.FACILITIES, facilities);
    return { success: true, message: 'Facility deleted' };
  },

  // --- Gallery ---
  getGallery(): GalleryItem[] {
    const gallery = getLocal<GalleryItem[]>(KEYS.GALLERY, []);
    if (!gallery || gallery.length === 0) {
      setLocal(KEYS.GALLERY, initialGallery);
      return initialGallery;
    }
    return gallery;
  },

  createGalleryItem(itemData: Partial<GalleryItem>): GalleryItem {
    const gallery = clientStorage.getGallery();
    const newItem: GalleryItem = {
      id: genId('gal'),
      title: itemData.title || 'Resort Photo',
      category: itemData.category || 'property',
      imageUrl:
        itemData.imageUrl ||
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      caption: itemData.caption || '',
      altText: itemData.altText || itemData.title || 'Bahar Retreat photo',
      order: gallery.length + 1,
      createdAt: new Date().toISOString(),
    };
    gallery.push(newItem);
    setLocal(KEYS.GALLERY, gallery);
    return newItem;
  },

  updateGalleryItem(id: string, updates: Partial<GalleryItem>): GalleryItem {
    const gallery = clientStorage.getGallery();
    const index = gallery.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Gallery item not found');
    const updated = { ...gallery[index], ...updates };
    gallery[index] = updated;
    setLocal(KEYS.GALLERY, gallery);
    return updated;
  },

  deleteGalleryItem(id: string): { success: boolean; message: string } {
    let gallery = clientStorage.getGallery();
    gallery = gallery.filter((g) => g.id !== id);
    setLocal(KEYS.GALLERY, gallery);
    return { success: true, message: 'Gallery item deleted' };
  },

  // --- Testimonials ---
  getTestimonials(): Testimonial[] {
    const testimonials = getLocal<Testimonial[]>(KEYS.TESTIMONIALS, []);
    if (!testimonials || testimonials.length === 0) {
      setLocal(KEYS.TESTIMONIALS, initialTestimonials);
      return initialTestimonials;
    }
    return testimonials;
  },

  // --- Bookings ---
  getBookings(status?: string, search?: string): Booking[] {
    let bookings = getLocal<Booking[]>(KEYS.BOOKINGS, []);
    if (!bookings || bookings.length === 0) {
      setLocal(KEYS.BOOKINGS, initialBookings);
      bookings = initialBookings;
    }

    let filtered = [...bookings];
    if (status && status !== 'all') {
      filtered = filtered.filter((b) => b.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.bookingRef.toLowerCase().includes(q) ||
          b.guestPhone.toLowerCase().includes(q) ||
          (b.guestEmail && b.guestEmail.toLowerCase().includes(q))
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getBookingDetail(id: string): Booking {
    const bookings = getLocal<Booking[]>(KEYS.BOOKINGS, initialBookings);
    const found = bookings.find((b) => b.id === id || b.bookingRef === id);
    if (!found) throw new Error('Booking not found');
    return found;
  },

  createBooking(bookingData: {
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
  }): Booking {
    const bookings = getLocal<Booking[]>(KEYS.BOOKINGS, initialBookings);
    const rooms = clientStorage.getRooms();
    const services = clientStorage.getServices();

    const selectedRoom = bookingData.roomId ? rooms.find((r) => r.id === bookingData.roomId) : undefined;
    const selectedService = bookingData.serviceId
      ? services.find((s) => s.id === bookingData.serviceId)
      : undefined;

    // Calculate nights
    let nights = 1;
    if (bookingData.checkInDate && bookingData.checkOutDate) {
      const diffTime = Math.abs(
        new Date(bookingData.checkOutDate).getTime() - new Date(bookingData.checkInDate).getTime()
      );
      nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const roomRate = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
    const serviceRate = selectedService ? selectedService.price : 0;
    const totalAmount = (roomRate + serviceRate) || 12000;

    const randomRefNum = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookingRef: `BRS-${new Date().getFullYear()}-${randomRefNum}`,
      guestName: bookingData.guestName,
      guestPhone: bookingData.guestPhone,
      guestEmail: bookingData.guestEmail,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      adults: Number(bookingData.adults) || 1,
      children: Number(bookingData.children) || 0,
      roomId: bookingData.roomId,
      roomName: selectedRoom?.name,
      serviceId: bookingData.serviceId,
      serviceName: selectedService?.name,
      specialRequests: bookingData.specialRequests || '',
      totalAmount,
      status: 'new',
      source: (bookingData.source as any) || 'website',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    setLocal(KEYS.BOOKINGS, bookings);
    return newBooking;
  },

  updateBooking(id: string, updates: Partial<Booking>): Booking {
    const bookings = getLocal<Booking[]>(KEYS.BOOKINGS, initialBookings);
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    const updated: Booking = {
      ...bookings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    bookings[index] = updated;
    setLocal(KEYS.BOOKINGS, bookings);
    return updated;
  },

  deleteBooking(id: string): { success: boolean; message: string } {
    let bookings = getLocal<Booking[]>(KEYS.BOOKINGS, initialBookings);
    bookings = bookings.filter((b) => b.id !== id);
    setLocal(KEYS.BOOKINGS, bookings);
    return { success: true, message: 'Booking deleted' };
  },

  // --- Enquiries ---
  getEnquiries(status?: string, search?: string): Enquiry[] {
    let enquiries = getLocal<Enquiry[]>(KEYS.ENQUIRIES, []);
    if (!enquiries || enquiries.length === 0) {
      setLocal(KEYS.ENQUIRIES, initialEnquiries);
      enquiries = initialEnquiries;
    }

    let filtered = [...enquiries];
    if (status && status !== 'all') {
      filtered = filtered.filter((e) => e.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.subject && e.subject.toLowerCase().includes(q)) ||
          e.message.toLowerCase().includes(q)
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  createEnquiry(data: {
    name: string;
    phone: string;
    email: string;
    subject?: string;
    message: string;
  }): { id: string; name: string } {
    const enquiries = getLocal<Enquiry[]>(KEYS.ENQUIRIES, initialEnquiries);
    const newEnquiry: Enquiry = {
      id: genId('enq'),
      name: data.name,
      phone: data.phone,
      email: data.email,
      subject: data.subject || 'Website General Enquiry',
      message: data.message,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    enquiries.unshift(newEnquiry);
    setLocal(KEYS.ENQUIRIES, enquiries);
    return { id: newEnquiry.id, name: newEnquiry.name };
  },

  updateEnquiry(id: string, updates: Partial<Enquiry>): Enquiry {
    const enquiries = getLocal<Enquiry[]>(KEYS.ENQUIRIES, initialEnquiries);
    const index = enquiries.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Enquiry not found');
    const updated: Enquiry = {
      ...enquiries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    enquiries[index] = updated;
    setLocal(KEYS.ENQUIRIES, enquiries);
    return updated;
  },

  deleteEnquiry(id: string): { success: boolean; message: string } {
    let enquiries = getLocal<Enquiry[]>(KEYS.ENQUIRIES, initialEnquiries);
    enquiries = enquiries.filter((e) => e.id !== id);
    setLocal(KEYS.ENQUIRIES, enquiries);
    return { success: true, message: 'Enquiry deleted' };
  },

  // --- Admin Stats ---
  getAdminStats(): DashboardStats {
    const bookings = clientStorage.getBookings();
    const enquiries = clientStorage.getEnquiries();

    const totalBookings = bookings.length;
    const newBookings = bookings.filter((b) => b.status === 'new').length;
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

    const totalRevenue = bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const pendingRevenue = bookings
      .filter((b) => b.status === 'new')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const totalEnquiries = enquiries.length;
    const newEnquiries = enquiries.filter((e) => e.status === 'new').length;

    return {
      totalBookings,
      newBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      pendingRevenue,
      totalEnquiries,
      newEnquiries,
    };
  },

  // --- Auth ---
  login(username: string, password: string): { token: string; user: AdminUser } {
    const customPassword = localStorage.getItem(KEYS.ADMIN_PASSWORD);
    const validPasswords = ['Bahar@Admin2026', 'admin123', 'admin'];
    if (customPassword) {
      validPasswords.push(customPassword);
    }

    const isUsernameValid =
      username.toLowerCase().trim() === 'admin' ||
      username.toLowerCase().trim() === 'admin@baharretreat.com';

    const isPasswordValid = validPasswords.includes(password.trim());

    if (!isUsernameValid || !isPasswordValid) {
      throw new Error('Invalid username or password. (Default credentials: admin / Bahar@Admin2026)');
    }

    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    localStorage.setItem(KEYS.TOKEN, token);
    return { token, user: initialAdminUser };
  },

  verifyAuth(): AdminUser {
    const token = localStorage.getItem(KEYS.TOKEN);
    if (!token) throw new Error('Not authenticated');
    return initialAdminUser;
  },

  changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    const customPassword = localStorage.getItem(KEYS.ADMIN_PASSWORD);
    const validCurrentPasswords = ['Bahar@Admin2026', 'admin123', 'admin'];
    if (customPassword) {
      validCurrentPasswords.push(customPassword);
    }

    if (!validCurrentPasswords.includes(currentPassword.trim())) {
      throw new Error('Current password is incorrect');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    localStorage.setItem(KEYS.ADMIN_PASSWORD, newPassword.trim());
    return { success: true, message: 'Password changed successfully' };
  },
};
