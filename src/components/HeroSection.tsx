import React, { useState } from 'react';
import { Calendar, Users, Phone, MessageCircle, Sparkles, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { WebsiteSettings, Room } from '../types.js';

interface HeroSectionProps {
  settings: WebsiteSettings;
  rooms: Room[];
  onOpenBooking: (roomId?: string, checkIn?: string, checkOut?: string, adults?: number) => void;
  onExploreRooms: () => void;
  onExploreSpa: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  rooms,
  onOpenBooking,
  onExploreRooms,
  onExploreSpa,
}) => {
  // Quick bar state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [adults, setAdults] = useState<number>(2);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking(selectedRoom || undefined, checkIn, checkOut, adults);
  };

  const handleWhatsAppChat = () => {
    const cleanPhone = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello Bahar Retreat And Spa (बाहर रिट्रीट एंड स्पा), I would like to enquire about room availability for ${checkIn} to ${checkOut}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="hero-section" className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-center pt-28 pb-16 lg:pb-24 overflow-hidden bg-[#1B4332]">
      
      {/* Background Image with Deep Forest Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://lh3.googleusercontent.com/d/10Eep-UI_w78O_OC1PhZEtdzME77m6bjY"
          alt="Bahar Retreat And Spa lush nature resort landscape"
          className="w-full h-full object-cover object-center transform scale-105 transition duration-1000"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=10Eep-UI_w78O_OC1PhZEtdzME77m6bjY';
          }}
        />
        {/* Multilayered Immersive Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/95 via-[#1B4332]/80 to-[#1B4332]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332] via-transparent to-[#1B4332]/50" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        
        {/* Brand Tagline Eyebrow Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#40916C] text-white text-[11px] uppercase font-bold tracking-[0.25em] mb-4 shadow-sm animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{settings.taglineHindi || 'प्रकृति, शांति और आयुर्वेदिक विश्राम का अनुपम संगम'}</span>
        </div>

        {/* Heading in English & Hindi */}
        <div className="max-w-4xl space-y-2 mb-6">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.02] drop-shadow-md">
            {settings.businessName || 'BAHAR RETREAT & SPA'}
          </h1>
          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#D8F3DC] font-medium tracking-wide">
            {settings.businessNameHindi || 'बाहर रिट्रीट एंड स्पा'}
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 font-light max-w-2xl pt-2 leading-relaxed">
            {settings.tagline || 'A Serene Sanctuary of Luxury, Wellness & Untamed Nature. Awaken to birdsong, breathe pristine mountain air, and restore your senses with authentic Ayurvedic healing.'}
          </p>
        </div>

        {/* Quick CTA Action Group */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
          <button
            id="hero-book-cta"
            onClick={() => onOpenBooking()}
            className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-8 py-4 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wider shadow-2xl transition hover:scale-105 active:scale-95 flex items-center space-x-2 border border-white/20"
          >
            <Calendar className="w-4 h-4 text-[#D8F3DC]" />
            <span>Book Your Stay Direct</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            id="hero-whatsapp-cta"
            onClick={handleWhatsAppChat}
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-7 py-3.5 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wider shadow-xl transition hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <a
            id="hero-call-cta"
            href={`tel:${settings.phone || '+919876543210'}`}
            className="bg-white text-[#1B4332] hover:bg-[#F1F8E9] px-7 py-3.5 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wider shadow-xl transition hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <Phone className="w-4 h-4 text-[#40916C]" />
            <span>Call Concierge</span>
          </a>
        </div>

        {/* Dynamic Quick Reservation Widget */}
        <div id="quick-reservation-card" className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#1B4332]/10 max-w-5xl text-[#1B4332]">
          <form onSubmit={handleQuickBook} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-end">
            
            {/* Check-In */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#40916C]" />
                <span>Check-In</span>
              </label>
              <input
                id="hero-checkin-date"
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-xl text-sm text-[#1B4332] font-medium focus:ring-2 focus:ring-[#40916C] focus:outline-none"
                required
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#40916C]" />
                <span>Check-Out</span>
              </label>
              <input
                id="hero-checkout-date"
                type="date"
                value={checkOut}
                min={checkIn || todayStr}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-xl text-sm text-[#1B4332] font-medium focus:ring-2 focus:ring-[#40916C] focus:outline-none"
                required
              />
            </div>

            {/* Accommodation Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1 flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-[#40916C]" />
                <span>Villa / Room</span>
              </label>
              <select
                id="hero-room-select"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-xl text-sm text-[#1B4332] font-medium focus:ring-2 focus:ring-[#40916C] focus:outline-none"
              >
                <option value="">Any Luxury Villa / Room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({settings.currencySymbol || '₹'}{r.pricePerNight.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#40916C]" />
                <span>Guests</span>
              </label>
              <select
                id="hero-guests-select"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-xl text-sm text-[#1B4332] font-medium focus:ring-2 focus:ring-[#40916C] focus:outline-none"
              >
                <option value={1}>1 Adult Guest</option>
                <option value={2}>2 Adult Guests</option>
                <option value={3}>3 Adult Guests</option>
                <option value={4}>4 Adult Guests</option>
                <option value={6}>5+ Group / Family</option>
              </select>
            </div>

            {/* Submit Bar Button */}
            <div>
              <button
                id="hero-submit-bar-btn"
                type="submit"
                className="w-full py-3 px-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>Check & Book</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Guarantee Badges */}
          <div className="mt-4 pt-3.5 border-t border-[#1B4332]/10 flex flex-wrap items-center justify-between text-xs text-[#1B4332]/90 font-medium gap-2">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#40916C]" />
              <span>Direct Booking Guarantee • Best Rates Guaranteed</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onExploreRooms}
                className="text-[11px] font-bold uppercase tracking-widest border-b border-[#1B4332] pb-0.5 hover:text-[#40916C] hover:border-[#40916C] transition"
              >
                View All Villas
              </button>
              <button
                type="button"
                onClick={onExploreSpa}
                className="text-[11px] font-bold uppercase tracking-widest border-b border-[#1B4332] pb-0.5 hover:text-[#40916C] hover:border-[#40916C] transition"
              >
                Spa Packages
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Subtle Scroll Indicator */}
      <div className="relative z-10 mt-6 text-center text-[#D8F3DC]/80 text-xs flex flex-col items-center animate-bounce">
        <span className="mb-1 uppercase tracking-widest text-[10px] font-bold">Scroll to Explore</span>
        <div className="w-4 h-7 border-2 border-[#D8F3DC]/50 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-[#D8F3DC] rounded-full" />
        </div>
      </div>

    </section>
  );
};
