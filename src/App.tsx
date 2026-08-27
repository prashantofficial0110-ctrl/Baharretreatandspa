import React, { useState, useEffect } from 'react';
import { PageView, Room, SpaService, Facility, GalleryItem, Testimonial, WebsiteSettings } from './types.js';
import { api } from './services/api.js';

// Components
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { AboutSection } from './components/AboutSection.js';
import { RoomsSection } from './components/RoomsSection.js';
import { SpaSection } from './components/SpaSection.js';
import { FacilitiesSection } from './components/FacilitiesSection.js';
import { GallerySection } from './components/GallerySection.js';
import { TestimonialsSection } from './components/TestimonialsSection.js';
import { ContactSection } from './components/ContactSection.js';
import { Footer } from './components/Footer.js';
import { FloatingActions } from './components/FloatingActions.js';
import { BookingModal } from './components/BookingModal.js';
import { AdminDashboard } from './components/AdminDashboard.js';

export function App() {
  const [activePage, setActivePage] = useState<PageView>('home');
  const [loading, setLoading] = useState<boolean>(true);

  // Dynamic Data State
  const [settings, setSettings] = useState<WebsiteSettings>({
    businessName: 'BAHAR RETREAT AND SPA',
    businessNameHindi: 'बाहर रिट्रीट एंड स्पा',
    tagline: 'A Serene Mountain & Forest Wellness Sanctuary',
    taglineHindi: 'प्रकृति की गोद में शांति और संपूर्ण कायाकल्प',
    logoUrl: 'https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC',
    phone: '+91 9854936290',
    secondaryPhone: '',
    whatsappNumber: '+91 9854936920',
    email: 'stay@baharretreat.com',
    address: 'Development Area,Near Pushpa Garage,Gangtok,Sikkim,India- 737101',
    addressHindi: 'डेवलपमेंट एरिया, पुष्पा गैराज के पास, गंगटोक, सिक्किम, भारत - 737101',
    googleMapsUrl: 'https://maps.google.com/?q=Development+Area+Near+Pushpa+Garage+Gangtok+Sikkim+India+737101',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    currency: 'INR',
    currencySymbol: '₹',
    seoTitle: 'Bahar Retreat And Spa | Luxury Resort & Ayurvedic Wellness',
    seoDescription: 'Experience nature-immersed luxury cottages, authentic Ayurvedic therapies, organic gastronomy, and serene mountain vistas at Bahar Retreat And Spa.',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com',
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<SpaService[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingRoomId, setBookingRoomId] = useState<string | undefined>();
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>();
  const [bookingCheckIn, setBookingCheckIn] = useState<string | undefined>();
  const [bookingCheckOut, setBookingCheckOut] = useState<string | undefined>();
  const [bookingAdults, setBookingAdults] = useState<number | undefined>();

  // Fetch initial public data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [st, r, s, f, g, t] = await Promise.all([
          api.getSettings().catch(() => settings),
          api.getRooms().catch(() => []),
          api.getServices().catch(() => []),
          api.getFacilities().catch(() => []),
          api.getGallery().catch(() => []),
          api.getTestimonials().catch(() => []),
        ]);

        if (st) setSettings(st);
        if (r && r.length) setRooms(r);
        if (s && s.length) setServices(s);
        if (f && f.length) setFacilities(f);
        if (g && g.length) setGallery(g);
        if (t && t.length) setTestimonials(t);
      } catch (err) {
        console.error('Failed to load website dynamic data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update Document Title based on settings
  useEffect(() => {
    if (settings.seoTitle) {
      document.title = settings.seoTitle;
    }
  }, [settings.seoTitle]);

  // Trigger Booking Modal Handler
  const handleOpenBooking = (
    roomId?: string,
    serviceId?: string,
    checkIn?: string,
    checkOut?: string,
    adults?: number
  ) => {
    setBookingRoomId(roomId);
    setBookingServiceId(serviceId);
    setBookingCheckIn(checkIn);
    setBookingCheckOut(checkOut);
    setBookingAdults(adults);
    setIsBookingOpen(true);
  };

  // If Admin View is active, render Dashboard directly
  if (activePage === 'admin') {
    return (
      <AdminDashboard
        onBackToSite={() => {
          setActivePage('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF5] text-[#1B4332] selection:bg-[#D8F3DC] selection:text-[#1B4332] font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        settings={settings}
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        
        {/* Single Page or Tabbed View depending on activePage */}
        {activePage === 'home' && (
          <>
            <HeroSection
              settings={settings}
              rooms={rooms}
              onOpenBooking={handleOpenBooking}
            />
            <AboutSection
              onOpenBooking={() => handleOpenBooking()}
            />
            <RoomsSection
              rooms={rooms}
              settings={settings}
              onOpenBooking={(rId) => handleOpenBooking(rId)}
            />
            <SpaSection
              services={services}
              settings={settings}
              onOpenBooking={(rId, sId) => handleOpenBooking(rId, sId)}
            />
            <FacilitiesSection
              facilities={facilities}
              onOpenBooking={() => handleOpenBooking()}
            />
            <GallerySection
              gallery={gallery}
            />
            <TestimonialsSection
              testimonials={testimonials}
            />
            <ContactSection
              settings={settings}
            />
          </>
        )}

        {activePage === 'about' && (
          <div className="pt-20">
            <AboutSection onOpenBooking={() => handleOpenBooking()} />
            <FacilitiesSection facilities={facilities} onOpenBooking={() => handleOpenBooking()} />
            <TestimonialsSection testimonials={testimonials} />
          </div>
        )}

        {activePage === 'rooms' && (
          <div className="pt-20">
            <RoomsSection
              rooms={rooms}
              settings={settings}
              onOpenBooking={(rId) => handleOpenBooking(rId)}
            />
          </div>
        )}

        {activePage === 'spa' && (
          <div className="pt-20">
            <SpaSection
              services={services}
              settings={settings}
              onOpenBooking={(rId, sId) => handleOpenBooking(rId, sId)}
            />
          </div>
        )}

        {activePage === 'facilities' && (
          <div className="pt-20">
            <FacilitiesSection
              facilities={facilities}
              onOpenBooking={() => handleOpenBooking()}
            />
          </div>
        )}

        {activePage === 'gallery' && (
          <div className="pt-20">
            <GallerySection
              gallery={gallery}
            />
          </div>
        )}

        {activePage === 'contact' && (
          <div className="pt-20">
            <ContactSection
              settings={settings}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        setActivePage={setActivePage}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Floating Call & WhatsApp & Mobile Sticky Actions */}
      <FloatingActions
        settings={settings}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Comprehensive Direct Booking Dialog */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        rooms={rooms}
        services={services}
        settings={settings}
        initialRoomId={bookingRoomId}
        initialServiceId={bookingServiceId}
        initialCheckIn={bookingCheckIn}
        initialCheckOut={bookingCheckOut}
        initialAdults={bookingAdults}
        onNavigateToAdmin={() => {
          setIsBookingOpen(false);
          setActivePage('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}

export default App;
