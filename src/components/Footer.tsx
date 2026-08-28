import React, { useState } from 'react';
import { Sparkles, Phone, Mail, MapPin, MessageCircle, Shield, Facebook, Instagram, Youtube, ChevronRight } from 'lucide-react';
import { WebsiteSettings, PageView } from '../types.js';

interface FooterProps {
  settings: WebsiteSettings;
  setActivePage: (page: PageView) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  setActivePage,
  onOpenBooking,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleNav = (page: PageView) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = () => {
    const cleanPhone = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello Bahar Retreat, I am contacting you from the website.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer id="main-footer" className="bg-[#1B4332] text-white pt-16 pb-24 sm:pb-16 border-t border-[#40916C]/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#40916C]/30">
          
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white border border-[#52B788]/40 flex items-center justify-center p-1 shadow-md overflow-hidden shrink-0">
                <img
                  src={settings.logoUrl || 'https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC'}
                  alt="Bahar Retreat Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC';
                  }}
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-white block">
                  {settings.businessName || 'BAHAR RETREAT'}
                </span>
                <span className="text-xs text-[#D8F3DC] font-semibold block">
                  {settings.tagline || 'Luxury Wellness & Ayurvedic Sanctuary'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm font-normal">
              {settings.description || 'A serene eco-luxury sanctuary nestled amid picturesque mountain valleys. Rejuvenate with authentic Ayurvedic therapies, organic culinary experiences, and peaceful nature stays.'}
            </p>

            {/* Social Links */}
            <div className="pt-2 flex items-center space-x-3">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2D6A4F] hover:bg-[#40916C] text-[#D8F3DC] hover:text-white flex items-center justify-center transition border border-[#40916C]/30"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2D6A4F] hover:bg-[#40916C] text-[#D8F3DC] hover:text-white flex items-center justify-center transition border border-[#40916C]/30"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2D6A4F] hover:bg-[#40916C] text-[#D8F3DC] hover:text-white flex items-center justify-center transition border border-[#40916C]/30"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={handleWhatsApp}
                className="w-9 h-9 rounded-full bg-[#40916C] hover:bg-[#52B788] text-white flex items-center justify-center transition shadow cursor-pointer"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-lg font-bold text-[#D8F3DC] uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#D8F3DC] transition flex items-center space-x-1 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[#D8F3DC] transition flex items-center space-x-1 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>About The Property</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('rooms')} className="hover:text-[#D8F3DC] transition flex items-center space-x-1 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Rooms & Cottages</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('spa')} className="hover:text-[#D8F3DC] transition flex items-center space-x-1 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Spa & Wellness</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('facilities')} className="hover:text-[#D8F3DC] transition flex items-center space-x-1 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Resort Facilities</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-[#D8F3DC] transition flex items-center space-x-1 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Photo Gallery</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-[#D8F3DC] transition flex items-center space-x-1 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Contact Concierge</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Experiences & Spa */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-lg font-bold text-[#D8F3DC] uppercase tracking-wider text-xs">
              Sanctuary Experiences
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li>• Signature Aroma Stone Massage</li>
              <li>• Shirodhara Chakra Balancing</li>
              <li>• Sunrise Mountain Yoga Pavilion</li>
              <li>• Organic Orchard Dining</li>
              <li>• Evening Bonfire & Tracking</li>
              <li>• Nature Trail Excursions</li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 rounded-full bg-[#40916C] hover:bg-[#52B788] text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Instant Reservation
              </button>
            </div>
          </div>

          {/* Col 4: Property Location & Direct Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-lg font-bold text-[#D8F3DC] uppercase tracking-wider text-xs">
              Property Location
            </h4>
            
            <div className="space-y-2.5 text-xs sm:text-sm text-white/80">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#52B788] shrink-0 mt-0.5" />
                <span>{settings.address || 'Development Area,Near Pushpa Garage,Gangtok,Sikkim,India- 737101'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#52B788] shrink-0" />
                <a href={`tel:${settings.phone || '+919876543210'}`} className="hover:text-[#D8F3DC] transition">
                  {settings.phone || '+91 98765 43210'}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#52B788] shrink-0" />
                <a href={`mailto:${settings.email || 'stay@baharretreat.com'}`} className="hover:text-[#D8F3DC] transition">
                  {settings.email || 'stay@baharretreat.com'}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-[#52B788] shrink-0" />
                <button onClick={handleWhatsApp} className="hover:text-[#D8F3DC] transition cursor-pointer">
                  WhatsApp: {settings.whatsappNumber || '+91 98765 43210'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Micro Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8F3DC]/70 gap-4">
          <div>
            © {new Date().getFullYear()} <strong>Bahar Retreat</strong>. All rights reserved.
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-white transition underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-white transition underline cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button
              id="footer-admin-link"
              onClick={() => handleNav('admin')}
              className="inline-flex items-center space-x-1 text-[#52B788] hover:text-[#D8F3DC] transition font-semibold cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </button>
          </div>
        </div>

      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/85 backdrop-blur-sm animate-fadeIn text-[#1B4332]">
          <div className="bg-[#FAFAF5] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto border border-[#1B4332]/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1B4332]/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1B4332]">Privacy Policy</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-[#1B4332]/50 hover:text-[#1B4332] cursor-pointer">✕</button>
            </div>
            <div className="text-xs sm:text-sm text-[#1B4332]/80 space-y-3 leading-relaxed">
              <p>
                At Bahar Retreat, we prioritize the protection and confidentiality of our guests’ personal data.
              </p>
              <p>
                <strong>Information Collection:</strong> Contact details, stay dates, and preferences submitted via our booking or enquiry forms are used solely for fulfilling reservations, communication, and enhancing your retreat stay.
              </p>
              <p>
                <strong>Data Security:</strong> We do not sell or disclose your personal data to third parties. All submitted data is stored securely in accordance with strict digital hospitality privacy standards.
              </p>
            </div>
            <div className="text-right pt-2">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-[#1B4332] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/85 backdrop-blur-sm animate-fadeIn text-[#1B4332]">
          <div className="bg-[#FAFAF5] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto border border-[#1B4332]/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1B4332]/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1B4332]">Terms & Conditions</h3>
              <button onClick={() => setShowTermsModal(false)} className="text-[#1B4332]/50 hover:text-[#1B4332] cursor-pointer">✕</button>
            </div>
            <div className="text-xs sm:text-sm text-[#1B4332]/80 space-y-3 leading-relaxed">
              <p>
                <strong>Check-In & Check-Out:</strong> Standard check-in time is 14:00 hrs and check-out is 11:00 hrs. Early arrivals or late departures are subject to availability.
              </p>
              <p>
                <strong>Identification:</strong> Government-recognized photo ID with address is required for all adult guests at the time of check-in.
              </p>
              <p>
                <strong>Quiet Sanctuary Philosophy:</strong> To preserve the restorative tranquility of all retreat guests, loud music and disruptive disturbances in outdoor public areas after 22:00 hrs are respectfully prohibited.
              </p>
            </div>
            <div className="text-right pt-2">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 bg-[#1B4332] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Terms
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};
