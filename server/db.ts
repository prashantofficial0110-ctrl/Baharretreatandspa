import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'manager';
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingRef: string; // e.g. BRS-2026-1042
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
  currencySymbol: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

interface DatabaseSchema {
  adminUsers: AdminUser[];
  bookings: Booking[];
  enquiries: Enquiry[];
  rooms: Room[];
  services: SpaService[];
  facilities: Facility[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  settings: WebsiteSettings;
}

const DB_FILE = path.join(process.cwd(), 'data', 'bahar_database.json');

// Ensure directory exists
function ensureDataDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial Seed Data with nature & spa aesthetics
const defaultSettings: WebsiteSettings = {
  businessName: 'Bahar Retreat And Spa',
  businessNameHindi: 'बाहर रिट्रीट एंड स्पा',
  tagline: 'A Serene Sanctuary of Luxury, Wellness & Untamed Nature',
  taglineHindi: 'प्रकृति, शांति और आयुर्वेदिक विश्राम का अनुपम संगम',
  description: 'Escape to Bahar Retreat And Spa, nestled amid tranquil nature. Experience bespoke luxury accommodations, rejuvenating Ayurvedic spa therapies, organic wellness dining, and authentic hospitality.',
  logoUrl: 'https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC',
  phone: '+91 9854936290',
  secondaryPhone: '',
  whatsappNumber: '+919854936920',
  email: 'stay@baharretreat.com',
  address: 'Development Area,Near Pushpa Garage,Gangtok,Sikkim,India- 737101',
  addressHindi: 'डेवलपमेंट एरिया, पुष्पा गैराज के पास, गंगटोक, सिक्किम, भारत - 737101',
  googleMapsUrl: 'https://maps.google.com/?q=Development+Area+Near+Pushpa+Garage+Gangtok+Sikkim+India+737101',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14175.0!2d88.61!3d27.33!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a56a5805eafb%3A0x73d3248f0883b12c!2sGangtok%2C%20Sikkim%20737101!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin',
  facebookUrl: 'https://facebook.com/baharretreatandspa',
  instagramUrl: 'https://instagram.com/baharretreatandspa',
  youtubeUrl: 'https://youtube.com/@baharretreatandspa',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  currencySymbol: '₹',
  seoTitle: 'Bahar Retreat And Spa | Luxury Resort & Wellness Sanctuary',
  seoDescription: 'Book direct at Bahar Retreat And Spa (बाहर रिट्रीट एंड स्पा). Discover forest-view villas, holistic ayurvedic spa therapies, peaceful retreat packages, and fine dining.',
  seoKeywords: 'Bahar Retreat And Spa, बाहर रिट्रीट एंड स्पा, luxury resort, wellness spa, ayurveda retreat, nature stay, resort booking, weekend getaway',
};

const defaultRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Bahar Royal Forest Villa',
    hindiName: 'बाहर रॉयल फ़ॉरेस्ट विला',
    slug: 'royal-forest-villa',
    tagline: 'Private garden veranda with panoramic valley vistas & plunge pool',
    description: 'Immerse yourself in nature within our spacious Royal Forest Villa. Features a plush king bed, private wrap-around deck overlooking pristine greenery, open-sky rain shower, and hand-crafted teakwood finishes.',
    pricePerNight: 12500,
    capacityAdults: 2,
    capacityChildren: 2,
    bedType: '1 King Bed + Daybed',
    sizeSqFt: 680,
    featuredImage: 'https://lh3.googleusercontent.com/d/1QkJyr8OPhvgj9Et9pIfKXg48B5GA8k1d',
    galleryImages: [
      'https://lh3.googleusercontent.com/d/1QkJyr8OPhvgj9Et9pIfKXg48B5GA8k1d',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Forest View', 'Private Plunge Jacuzzi', 'King Size Bed', 'En-suite Luxury Bath', 'High-Speed Wi-Fi', 'Complimentary Organic Breakfast', 'Tea & Espresso Bar', 'Climate Control'],
    isAvailable: true,
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-2',
    name: 'Serene Garden Cottage',
    hindiName: 'सेरीन गार्डन कॉटेज',
    slug: 'serene-garden-cottage',
    tagline: 'Nestled amid blooming botanical flora with private patio',
    description: 'A tranquil haven surrounded by organic herb gardens and birdsong. Ideal for couples seeking restorative quietude with organic linens, artisanal bath amenities, and warm nature lighting.',
    pricePerNight: 8500,
    capacityAdults: 2,
    capacityChildren: 1,
    bedType: '1 King Bed',
    sizeSqFt: 480,
    featuredImage: 'https://lh3.googleusercontent.com/d/1F-T6hSi1qQrHFSclgjq0K6n95xg2vkeM',
    galleryImages: [
      'https://lh3.googleusercontent.com/d/1F-T6hSi1qQrHFSclgjq0K6n95xg2vkeM',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Garden View', 'Private Patio', 'Herbal Welcome Drink', 'Premium Toiletries', 'Wi-Fi', 'Daily Morning Yoga', 'Electric Kettle & Teas'],
    isAvailable: true,
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-3',
    name: 'Retreat Luxury Suite',
    hindiName: 'रिट्रीट लग्जरी सुइट',
    slug: 'retreat-luxury-suite',
    tagline: 'Expansive master suite with private living lounge & sunset balcony',
    description: 'Designed for discerning travelers who appreciate understated opulence and serene landscapes. Includes a dedicated dining nook, marble bathroom with soaking tub, and oversized balcony.',
    pricePerNight: 16000,
    capacityAdults: 3,
    capacityChildren: 2,
    bedType: '1 King Bed + 1 Queen Daybed',
    sizeSqFt: 820,
    featuredImage: 'https://lh3.googleusercontent.com/d/1ot1EzPqAdGBfGoLepUfQZ0c-25BdpVJ1',
    galleryImages: [
      'https://lh3.googleusercontent.com/d/1ot1EzPqAdGBfGoLepUfQZ0c-25BdpVJ1',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Mountain View Balcony', 'Soaking Bathtub', 'Separate Living Room', 'Butler Service on Request', 'Complimentary Spa Voucher', 'Smart LED TV', 'Mini Bar & Snacks'],
    isAvailable: true,
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-4',
    name: 'Wellness Sanctuary Family Chalet',
    hindiName: 'वेलनेस सैंक्चुअरी फ़ैमिली शैले',
    slug: 'wellness-family-chalet',
    tagline: 'Two-bedroom private sanctuary for families and wellness groups',
    description: 'A harmonious retreat with dual ensuite bedrooms, communal family lounge, private campfire clearing, and expansive picture windows welcoming the morning sun and gentle mountain breeze.',
    pricePerNight: 22000,
    capacityAdults: 4,
    capacityChildren: 3,
    bedType: '2 King Beds',
    sizeSqFt: 1150,
    featuredImage: 'https://lh3.googleusercontent.com/d/1r1ksY9AFQREluGnoVVTgllNFrx94Fm5h',
    galleryImages: [
      'https://lh3.googleusercontent.com/d/1r1ksY9AFQREluGnoVVTgllNFrx94Fm5h',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['2 Ensuite Bedrooms', 'Private Lawn', 'Fireplace', 'Complimentary High Tea', 'Kids Play Area Access', 'Personal Concierge', 'High-Speed Wi-Fi'],
    isAvailable: true,
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
  },
];

const defaultServices: SpaService[] = [
  {
    id: 'service-2',
    name: 'Shirodhara Mind & Stress Relief',
    hindiName: 'शिरोधरा ध्यान एवं तनाव मुक्ति',
    category: 'Ayurveda',
    durationMinutes: 60,
    price: 4200,
    description: 'A continuous stream of warm medicated herbal oil poured gently onto the forehead (third eye chakra), inducing a state of deep meditative stillness and mental clarity.',
    benefits: ['Alleviates insomnia & anxiety', 'Calms chronic headaches', 'Deeply grounds mental focus'],
    featuredImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-3',
    name: 'Bahar Signature Aroma Stone Massage',
    hindiName: 'बाहर सिग्नेचर अरोमा स्टोन मसाज',
    category: 'Massage',
    durationMinutes: 90,
    price: 4800,
    description: 'Smooth heated basalt stones infused with forest lavender and eucalyptus essential oils glide along key energy meridians to dissolve deep-seated physical fatigue.',
    benefits: ['Deep tissue muscle relaxation', 'Aromatic sensory balance', 'Stimulates metabolic flow'],
    featuredImage: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-5',
    name: 'Sunrise Pranayama & Mountain Yoga',
    hindiName: 'सूर्योदय प्राणायाम एवं योग साधना',
    category: 'Yoga & Meditation',
    durationMinutes: 60,
    price: 1500,
    description: 'Guided breathwork, gentle restorative Hatha asanas, and guided sound bowl meditation conducted in our open-air wooden yoga shala overlooking the valley.',
    benefits: ['Awakens core vitality', 'Improves joint flexibility', 'Inner peace and mindfulness'],
    featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-6',
    name: 'Himalayan Pink Salt Body Scrub & Wrap',
    hindiName: 'हिमालयन पिंक सॉल्ट बॉडी स्क्रब',
    category: 'Body Rituals',
    durationMinutes: 75,
    price: 3600,
    description: 'Mineral-rich Himalayan crystals blended with sweet almond oil polish dull skin cells, followed by a warm herbal wrap and invigorating eucalyptus shower rinse.',
    benefits: ['Silky smooth skin texture', 'Removes dead cellular buildup', 'Boosts skin microcirculation'],
    featuredImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
  }
];

const defaultFacilities: Facility[] = [
  {
    id: 'fac-2',
    name: 'Ayurvedic Wellness Spa Center',
    hindiName: 'आयुर्वेदिक स्पा केंद्र',
    iconName: 'Sparkles',
    description: 'Holistic healing sanctuary featuring steam rooms, herbal therapy suites, and private consultation.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 1,
  },
  {
    id: 'fac-3',
    name: 'Farm-to-Table Nature Dining',
    hindiName: 'ऑर्गेनिक रेस्तरां',
    iconName: 'UtensilsCrossed',
    description: 'Nutritious gourmet cuisine prepared with fresh produce harvested daily from local organic orchards.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 2,
  },
  {
    id: 'fac-4',
    name: 'Open-Air Wooden Yoga Pavilion',
    hindiName: 'योग एवं ध्यान मंडप',
    iconName: 'Sun',
    description: 'Spacious teak-decked yoga shala with 360-degree mountain views for meditation and sound baths.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 3,
  },
  {
    id: 'fac-5',
    name: 'Bonfire & Tracking',
    hindiName: 'अलाव एवं ट्रैकिंग',
    iconName: 'Flame',
    description: 'Evening gatherings with cozy open fires, guided forest nature trails, wilderness tracking, and starlit nights.',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 4,
  }
];

const defaultGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Bahar Retreat Property Sanctuary',
    category: 'property',
    imageUrl: 'https://lh3.googleusercontent.com/d/1EetXxIQBXd3M0kytBfq34JkA8zysfCm-',
    caption: 'Lush greenery, peaceful surroundings, and architecture of Bahar Retreat & Spa.',
    altText: 'Bahar Retreat And Spa exterior landscape surrounded by mountains and trees',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-2',
    title: 'Royal Forest Villa Bedroom',
    category: 'rooms',
    imageUrl: 'https://lh3.googleusercontent.com/d/1QkJyr8OPhvgj9Et9pIfKXg48B5GA8k1d',
    caption: 'Handcrafted wooden bed frame and floor-to-ceiling glass doors.',
    altText: 'Luxurious king bedroom at Bahar Retreat with garden view',
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-3',
    title: 'Ayurvedic Shirodhara Suite',
    category: 'spa',
    imageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80',
    caption: 'Authentic brass oil vessel and calming herbal atmosphere.',
    altText: 'Spa treatment room set up for Ayurvedic therapy at Bahar Spa',
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-5',
    title: 'Outdoor Dining Under the Canopy',
    category: 'dining',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    caption: 'Fresh farm-to-table cuisine prepared with mountain herbs.',
    altText: 'Gourmet organic dining table set in outdoor terrace',
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-7',
    title: 'Warm Herbal Hot Stone Therapy',
    category: 'spa',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
    caption: 'Basalt river stones and cold-pressed botanical oils.',
    altText: 'Hot stone therapy setup on luxury wooden massage bed',
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-8',
    title: 'Sunrise Yoga Shala',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    caption: 'Morning meditation session surrounded by mountain air.',
    altText: 'Sunlight streaming into the peaceful yoga pavilion',
    order: 6,
    createdAt: new Date().toISOString(),
  }
];

const defaultTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    guestName: 'Souvik & Rituparna Roy',
    guestLocation: 'Kolkata, India (Google Maps Review)',
    rating: 5,
    comment: 'Staying at Bahar Retreat in the Development Area was an extraordinary experience. The mountain valley views from our balcony were breathtaking, and host Sourav went above and beyond to make us feel completely at home. The rooms were spotless and the home-cooked food was fresh and delicious. Just minutes away from MG Marg yet so peaceful!',
    stayType: 'Google Verified Stay',
    isPublished: true,
    createdAt: '2026-06-14T10:00:00Z',
  },
  {
    id: 'test-2',
    guestName: 'Pooja Sharma',
    guestLocation: 'Delhi, India (Google Maps Review)',
    rating: 5,
    comment: 'A true hidden sanctuary in Gangtok! The warmth, humbleness of the staff, and calming nature vibes made our trip memorable. Loved having morning tea on the patio looking across the hills. The cozy rooms and genuine care made us feel like family. Highly recommend Bahar Retreat and Spa to everyone visiting Sikkim.',
    stayType: 'Google Verified Stay',
    isPublished: true,
    createdAt: '2026-07-02T15:30:00Z',
  },
  {
    id: 'test-3',
    guestName: 'Arun & Meera Krishnan',
    guestLocation: 'Bengaluru, India (Google Maps Review)',
    rating: 5,
    comment: 'One of the best boutique stays in Gangtok. Located in the quiet, scenic Development Area near Pushpa Garage, away from city commotion. The hospitality by Sourav and the team is unmatched. The cleanliness, peaceful atmosphere, and personalized attention exceeded all expectations.',
    stayType: 'Google Verified Stay',
    isPublished: true,
    createdAt: '2026-07-28T09:15:00Z',
  },
  {
    id: 'test-4',
    guestName: 'Elena & David Rossi',
    guestLocation: 'Milan, Italy (Google Maps Review)',
    rating: 5,
    comment: 'Bahar Retreat is a wonderful place with great vibes. Outstanding hospitality, lovely panoramic views of the surrounding valleys, and very comfortable and clean rooms. The staff is exceptionally kind and helpful with sightseeing and permits across Sikkim. We will definitely return!',
    stayType: 'Google Verified Stay',
    isPublished: true,
    createdAt: '2026-08-10T12:00:00Z',
  }
];

// Sample Bookings for Admin display & testing
const defaultBookings: Booking[] = [
  {
    id: 'book-1',
    bookingRef: 'BRS-2026-1048',
    guestName: 'Vikram Malhotra',
    guestPhone: '+91 98200 12345',
    guestEmail: 'vikram.m@example.com',
    checkInDate: '2026-09-10',
    checkOutDate: '2026-09-14',
    adults: 2,
    children: 1,
    roomId: 'room-1',
    roomName: 'Bahar Royal Forest Villa',
    serviceId: 'service-2',
    serviceName: 'Shirodhara Mind & Stress Relief',
    specialRequests: 'Ground floor preference, late evening check-in around 7 PM.',
    totalAmount: 53800,
    status: 'confirmed',
    internalNotes: 'VIP anniversary guests. Complimentary fruit basket ordered.',
    source: 'website',
    createdAt: '2026-08-20T14:22:00Z',
    updatedAt: '2026-08-21T09:00:00Z',
  },
  {
    id: 'book-2',
    bookingRef: 'BRS-2026-1049',
    guestName: 'Pooja Sharma',
    guestPhone: '+91 97110 54321',
    guestEmail: 'pooja.s@example.com',
    checkInDate: '2026-09-18',
    checkOutDate: '2026-09-20',
    adults: 2,
    children: 0,
    roomId: 'room-2',
    roomName: 'Serene Garden Cottage',
    serviceId: 'service-2',
    serviceName: 'Shirodhara Mind & Stress Relief',
    specialRequests: 'Vegan meal plan for both guests please.',
    totalAmount: 21200,
    status: 'new',
    internalNotes: 'Needs confirmation call for arrival transportation.',
    source: 'whatsapp',
    createdAt: '2026-08-24T11:10:00Z',
    updatedAt: '2026-08-24T11:10:00Z',
  }
];

const defaultEnquiries: Enquiry[] = [
  {
    id: 'enq-1',
    name: 'Amitabh Sen',
    phone: '+91 99887 76655',
    email: 'amitabh.sen@example.com',
    subject: 'Corporate Wellness Retreat Enquiry',
    message: 'Hello, we are planning a 3-day wellness and team rejuvenation retreat for 15 executives in October. Could you please share group pricing and customized spa packages?',
    status: 'new',
    internalNotes: 'High potential group booking. Sent preliminary brochure via WhatsApp.',
    createdAt: '2026-08-23T16:45:00Z',
    updatedAt: '2026-08-23T16:45:00Z',
  },
  {
    id: 'enq-2',
    name: 'Kavita Joshi',
    phone: '+91 94120 33445',
    email: 'kavita.j@example.com',
    subject: 'Ayurvedic Treatment Consultation',
    message: 'Can I book custom Panchakarma sessions without an overnight stay, or is it exclusively for resident guests?',
    status: 'contacted',
    internalNotes: 'Informed day spa packages are available on weekdays.',
    createdAt: '2026-08-22T08:30:00Z',
    updatedAt: '2026-08-22T10:15:00Z',
  }
];

class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = {
      adminUsers: [],
      bookings: [],
      enquiries: [],
      rooms: [],
      services: [],
      facilities: [],
      gallery: [],
      testimonials: [],
      settings: defaultSettings,
    };
    this.init();
  }

  private init() {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        this.data = {
          adminUsers: parsed.adminUsers || [],
          bookings: parsed.bookings || defaultBookings,
          enquiries: parsed.enquiries || defaultEnquiries,
          rooms: (parsed.rooms?.length ? parsed.rooms : defaultRooms).map((r: Room) => {
            if (r.id === 'room-1' && (r.featuredImage.includes('unsplash.com') || !r.featuredImage)) {
              return {
                ...r,
                featuredImage: 'https://lh3.googleusercontent.com/d/1QkJyr8OPhvgj9Et9pIfKXg48B5GA8k1d',
                galleryImages: [
                  'https://lh3.googleusercontent.com/d/1QkJyr8OPhvgj9Et9pIfKXg48B5GA8k1d',
                  ...(r.galleryImages?.slice(1) || [])
                ]
              };
            }
            if (r.id === 'room-2' && (r.featuredImage.includes('unsplash.com') || !r.featuredImage)) {
              return {
                ...r,
                featuredImage: 'https://lh3.googleusercontent.com/d/1F-T6hSi1qQrHFSclgjq0K6n95xg2vkeM',
                galleryImages: [
                  'https://lh3.googleusercontent.com/d/1F-T6hSi1qQrHFSclgjq0K6n95xg2vkeM',
                  ...(r.galleryImages?.slice(1) || [])
                ]
              };
            }
            if (r.id === 'room-3' && (r.featuredImage.includes('unsplash.com') || !r.featuredImage)) {
              return {
                ...r,
                featuredImage: 'https://lh3.googleusercontent.com/d/1ot1EzPqAdGBfGoLepUfQZ0c-25BdpVJ1',
                galleryImages: [
                  'https://lh3.googleusercontent.com/d/1ot1EzPqAdGBfGoLepUfQZ0c-25BdpVJ1',
                  ...(r.galleryImages?.slice(1) || [])
                ]
              };
            }
            if (r.id === 'room-4' && (r.featuredImage.includes('unsplash.com') || !r.featuredImage)) {
              return {
                ...r,
                featuredImage: 'https://lh3.googleusercontent.com/d/1r1ksY9AFQREluGnoVVTgllNFrx94Fm5h',
                galleryImages: [
                  'https://lh3.googleusercontent.com/d/1r1ksY9AFQREluGnoVVTgllNFrx94Fm5h',
                  ...(r.galleryImages?.slice(1) || [])
                ]
              };
            }
            return r;
          }),
          services: (parsed.services?.length ? parsed.services : defaultServices)
            .filter((s: SpaService) => s.id !== 'service-1' && s.id !== 'service-4' && !s.name.toLowerCase().includes('abhyanga') && !s.name.toLowerCase().includes('botanical radiance'))
            .map((s: SpaService, idx: number) => ({ ...s, order: idx + 1 })),
          facilities: (parsed.facilities?.length ? parsed.facilities : defaultFacilities)
            .filter((f: Facility) => f.id !== 'fac-1' && f.id !== 'fac-6' && !f.name.toLowerCase().includes('infinity plunge') && !f.name.toLowerCase().includes('wi-fi & concierge'))
            .map((f: Facility, idx: number) => {
              if (f.id === 'fac-5' || f.name.toLowerCase().includes('bonfire')) {
                return {
                  ...f,
                  name: 'Bonfire & Tracking',
                  hindiName: 'अलाव एवं ट्रैकिंग',
                  description: 'Evening gatherings with cozy open fires, guided forest nature trails, wilderness tracking, and starlit nights.',
                  order: idx + 1,
                };
              }
              return { ...f, order: idx + 1 };
            }),
          gallery: (parsed.gallery?.length ? parsed.gallery : defaultGallery)
            .filter((g: GalleryItem) => g.id !== 'gal-4' && g.id !== 'gal-6' && !g.title?.toLowerCase().includes('infinity pool') && !g.title?.toLowerCase().includes('private veranda') && !g.caption?.toLowerCase().includes('pool waters'))
            .map((g: GalleryItem, idx: number) => {
              let updated = { ...g, order: idx + 1 };
              if (g.id === 'gal-1' && (g.imageUrl.includes('unsplash.com') || !g.imageUrl)) {
                updated.imageUrl = 'https://lh3.googleusercontent.com/d/1EetXxIQBXd3M0kytBfq34JkA8zysfCm-';
              }
              if (g.id === 'gal-2' && (g.imageUrl.includes('unsplash.com') || !g.imageUrl)) {
                updated.imageUrl = 'https://lh3.googleusercontent.com/d/1QkJyr8OPhvgj9Et9pIfKXg48B5GA8k1d';
              }
              return updated;
            }),
          testimonials: parsed.testimonials?.length ? parsed.testimonials : defaultTestimonials,
          settings: {
            ...defaultSettings,
            ...(parsed.settings || {}),
            secondaryPhone: (parsed.settings?.secondaryPhone && parsed.settings.secondaryPhone.includes('98765 43211'))
              ? ''
              : (parsed.settings?.secondaryPhone || ''),
            logoUrl: parsed.settings?.logoUrl || defaultSettings.logoUrl,
            address: (!parsed.settings?.address || parsed.settings.address.includes('Bahar Valley Road') || parsed.settings.address.includes('Uttarakhand'))
              ? 'Development Area,Near Pushpa Garage,Gangtok,Sikkim,India- 737101'
              : parsed.settings.address,
            addressHindi: (!parsed.settings?.addressHindi || parsed.settings.addressHindi.includes('उत्तराखंड') || parsed.settings.addressHindi.includes('बाहर वैली'))
              ? 'डेवलपमेंट एरिया, पुष्पा गैराज के पास, गंगटोक, सिक्किम, भारत - 737101'
              : parsed.settings.addressHindi,
            googleMapsUrl: (!parsed.settings?.googleMapsUrl || parsed.settings.googleMapsUrl.includes('Bahar+Retreat'))
              ? 'https://maps.google.com/?q=Development+Area+Near+Pushpa+Garage+Gangtok+Sikkim+India+737101'
              : parsed.settings.googleMapsUrl,
          },
        };
        this.isLoaded = true;
      } catch (err) {
        console.error('Error loading DB file, reinitializing:', err);
        this.seedInitial();
      }
    } else {
      this.seedInitial();
    }

    // Ensure admin user exists
    if (this.data.adminUsers.length === 0) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('bahar@retreat2026', salt);
      this.data.adminUsers.push({
        id: 'admin-1',
        username: 'admin',
        email: 'admin@baharretreat.com',
        passwordHash: hash,
        name: 'Bahar Retreat Administrator',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      this.save();
    }
  }

  private seedInitial() {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('bahar@retreat2026', salt);

    this.data = {
      adminUsers: [
        {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@baharretreat.com',
          passwordHash: hash,
          name: 'Bahar Retreat Administrator',
          role: 'admin',
          createdAt: new Date().toISOString(),
        }
      ],
      bookings: defaultBookings,
      enquiries: defaultEnquiries,
      rooms: defaultRooms,
      services: defaultServices,
      facilities: defaultFacilities,
      gallery: defaultGallery,
      testimonials: defaultTestimonials,
      settings: defaultSettings,
    };
    this.save();
    this.isLoaded = true;
  }

  private save() {
    try {
      ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // Admin Auth Queries
  getAdminByUsername(usernameOrEmail: string): AdminUser | undefined {
    return this.data.adminUsers.find(
      (u) => u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );
  }

  getAdminById(id: string): AdminUser | undefined {
    return this.data.adminUsers.find((u) => u.id === id);
  }

  updateAdminPassword(id: string, newPasswordHash: string): boolean {
    const user = this.data.adminUsers.find((u) => u.id === id);
    if (user) {
      user.passwordHash = newPasswordHash;
      this.save();
      return true;
    }
    return false;
  }

  // Bookings Queries & CRUD
  getAllBookings(): Booking[] {
    return [...this.data.bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find((b) => b.id === id || b.bookingRef === id);
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'bookingRef' | 'createdAt' | 'updatedAt'>): Booking {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `BRS-${new Date().getFullYear()}-${randomNum}`;
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookingRef,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.bookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  // EDIT submitted booking details (Critical Requirement!)
  updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const index = this.data.bookings.findIndex((b) => b.id === id || b.bookingRef === id);
    if (index === -1) return null;

    const existing = this.data.bookings[index];
    const updated: Booking = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve immutable ID
      bookingRef: existing.bookingRef, // Preserve booking reference
      updatedAt: new Date().toISOString(),
    };

    this.data.bookings[index] = updated;
    this.save();
    return updated;
  }

  deleteBooking(id: string): boolean {
    const initialLen = this.data.bookings.length;
    this.data.bookings = this.data.bookings.filter((b) => b.id !== id && b.bookingRef !== id);
    if (this.data.bookings.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Enquiries Queries & CRUD
  getAllEnquiries(): Enquiry[] {
    return [...this.data.enquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getEnquiryById(id: string): Enquiry | undefined {
    return this.data.enquiries.find((e) => e.id === id);
  }

  createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>): Enquiry {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.enquiries.unshift(newEnquiry);
    this.save();
    return newEnquiry;
  }

  updateEnquiry(id: string, updates: Partial<Enquiry>): Enquiry | null {
    const index = this.data.enquiries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = this.data.enquiries[index];
    const updated: Enquiry = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    this.data.enquiries[index] = updated;
    this.save();
    return updated;
  }

  deleteEnquiry(id: string): boolean {
    const initialLen = this.data.enquiries.length;
    this.data.enquiries = this.data.enquiries.filter((e) => e.id !== id);
    if (this.data.enquiries.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Rooms CRUD
  getAllRooms(onlyActive = false): Room[] {
    let list = this.data.rooms;
    if (onlyActive) {
      list = list.filter((r) => r.isActive);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }

  getRoomById(id: string): Room | undefined {
    return this.data.rooms.find((r) => r.id === id || r.slug === id);
  }

  createRoom(roomData: Omit<Room, 'id' | 'createdAt'>): Room {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.rooms.push(newRoom);
    this.save();
    return newRoom;
  }

  updateRoom(id: string, updates: Partial<Room>): Room | null {
    const index = this.data.rooms.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated: Room = {
      ...this.data.rooms[index],
      ...updates,
      id: this.data.rooms[index].id,
    };
    this.data.rooms[index] = updated;
    this.save();
    return updated;
  }

  deleteRoom(id: string): boolean {
    const initialLen = this.data.rooms.length;
    this.data.rooms = this.data.rooms.filter((r) => r.id !== id);
    if (this.data.rooms.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Spa Services CRUD
  getAllServices(onlyActive = false): SpaService[] {
    let list = this.data.services;
    if (onlyActive) {
      list = list.filter((s) => s.isActive);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }

  getServiceById(id: string): SpaService | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  createService(serviceData: Omit<SpaService, 'id' | 'createdAt'>): SpaService {
    const newService: SpaService = {
      ...serviceData,
      id: `service-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.services.push(newService);
    this.save();
    return newService;
  }

  updateService(id: string, updates: Partial<SpaService>): SpaService | null {
    const index = this.data.services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updated: SpaService = {
      ...this.data.services[index],
      ...updates,
      id: this.data.services[index].id,
    };
    this.data.services[index] = updated;
    this.save();
    return updated;
  }

  deleteService(id: string): boolean {
    const initialLen = this.data.services.length;
    this.data.services = this.data.services.filter((s) => s.id !== id);
    if (this.data.services.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Facilities CRUD
  getAllFacilities(onlyActive = false): Facility[] {
    let list = this.data.facilities;
    if (onlyActive) {
      list = list.filter((f) => f.isActive);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }

  createFacility(facilityData: Omit<Facility, 'id'>): Facility {
    const newFacility: Facility = {
      ...facilityData,
      id: `fac-${Date.now()}`,
    };
    this.data.facilities.push(newFacility);
    this.save();
    return newFacility;
  }

  updateFacility(id: string, updates: Partial<Facility>): Facility | null {
    const index = this.data.facilities.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const updated: Facility = {
      ...this.data.facilities[index],
      ...updates,
      id: this.data.facilities[index].id,
    };
    this.data.facilities[index] = updated;
    this.save();
    return updated;
  }

  deleteFacility(id: string): boolean {
    const initialLen = this.data.facilities.length;
    this.data.facilities = this.data.facilities.filter((f) => f.id !== id);
    if (this.data.facilities.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Gallery CRUD
  getAllGalleryItems(): GalleryItem[] {
    return [...this.data.gallery].sort((a, b) => a.order - b.order);
  }

  createGalleryItem(galleryData: Omit<GalleryItem, 'id' | 'createdAt'>): GalleryItem {
    const newItem: GalleryItem = {
      ...galleryData,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.gallery.push(newItem);
    this.save();
    return newItem;
  }

  updateGalleryItem(id: string, updates: Partial<GalleryItem>): GalleryItem | null {
    const index = this.data.gallery.findIndex((g) => g.id === id);
    if (index === -1) return null;

    const updated: GalleryItem = {
      ...this.data.gallery[index],
      ...updates,
      id: this.data.gallery[index].id,
    };
    this.data.gallery[index] = updated;
    this.save();
    return updated;
  }

  deleteGalleryItem(id: string): boolean {
    const initialLen = this.data.gallery.length;
    this.data.gallery = this.data.gallery.filter((g) => g.id !== id);
    if (this.data.gallery.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Testimonials CRUD
  getAllTestimonials(onlyPublished = false): Testimonial[] {
    let list = this.data.testimonials;
    if (onlyPublished) {
      list = list.filter((t) => t.isPublished);
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Settings
  getSettings(): WebsiteSettings {
    return { ...this.data.settings };
  }

  updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.save();
    return { ...this.data.settings };
  }

  // Stats for Admin
  getDashboardStats() {
    const totalBookings = this.data.bookings.length;
    const newEnquiries = this.data.enquiries.filter((e) => e.status === 'new').length;
    const pendingBookings = this.data.bookings.filter((b) => b.status === 'pending').length;
    const newBookings = this.data.bookings.filter((b) => b.status === 'new').length;
    const confirmedBookings = this.data.bookings.filter((b) => b.status === 'confirmed').length;
    const completedBookings = this.data.bookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = this.data.bookings.filter((b) => b.status === 'cancelled').length;

    const recentBookings = this.data.bookings.slice(0, 5);
    const recentEnquiries = this.data.enquiries.slice(0, 5);

    return {
      totalBookings,
      newEnquiries,
      pendingBookings,
      newBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      recentBookings,
      recentEnquiries,
      totalRooms: this.data.rooms.length,
      totalServices: this.data.services.length,
      totalGallery: this.data.gallery.length,
    };
  }
}

export const db = new Database();
