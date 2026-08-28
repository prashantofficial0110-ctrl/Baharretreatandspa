export interface WebsiteSettings {
  businessName: string;
  businessNameHindi: string;
  tagline: string;
  taglineHindi: string;
  description: string;
  logoUrl?: string;
  phone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  addressHindi: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  checkInTime: string;
  checkOutTime: string;
  currency?: string;
  currencySymbol: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface Room {
  id: string;
  name: string;
  hindiName?: string;
  slug: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  capacityAdults: number;
  capacityChildren: number;
  bedType: string;
  sizeSqFt: number;
  featuredImage: string;
  galleryImages: string[];
  amenities: string[];
  isAvailable: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface SpaService {
  id: string;
  name: string;
  hindiName?: string;
  category: 'Ayurveda' | 'Massage' | 'Facial' | 'Wellness' | 'Body Rituals' | 'Yoga & Meditation';
  durationMinutes: number;
  price: number;
  description: string;
  benefits: string[];
  featuredImage: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface Facility {
  id: string;
  name: string;
  hindiName?: string;
  iconName: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'rooms' | 'spa' | 'property' | 'dining' | 'nature';
  imageUrl: string;
  caption?: string;
  altText: string;
  order: number;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  guestName: string;
  guestLocation: string;
  rating: number;
  comment: string;
  stayType?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomId: string;
  roomName: string;
  serviceId?: string;
  serviceName?: string;
  specialRequests?: string;
  totalAmount?: number;
  status: 'new' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  internalNotes?: string;
  source: 'website' | 'whatsapp' | 'admin' | 'phone';
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

export interface DashboardStats {
  totalBookings: number;
  newEnquiries: number;
  pendingBookings?: number;
  newBookings: number;
  confirmedBookings: number;
  completedBookings?: number;
  cancelledBookings: number;
  totalRevenue?: number;
  pendingRevenue?: number;
  totalEnquiries?: number;
  recentBookings?: Booking[];
  recentEnquiries?: Enquiry[];
  totalRooms?: number;
  totalServices?: number;
  totalGallery?: number;
}

export type PageView =
  | 'home'
  | 'about'
  | 'rooms'
  | 'spa'
  | 'facilities'
  | 'gallery'
  | 'booking'
  | 'contact'
  | 'admin';
