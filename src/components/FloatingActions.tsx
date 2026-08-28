import React, { useState } from 'react';
import { Phone, MessageCircle, Calendar, Sparkles, X, ChevronUp } from 'lucide-react';
import { WebsiteSettings } from '../types.js';

interface FloatingActionsProps {
  settings: WebsiteSettings;
  onOpenBooking: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  settings,
  onOpenBooking,
}) => {
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);

  const cleanPhone = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');

  const handleWhatsAppDirect = (customMsg?: string) => {
    const text = encodeURIComponent(
      customMsg || `Hello Bahar Retreat, I would like to enquire about room bookings & spa treatments.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
    setShowWhatsAppPopup(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop Floating WhatsApp & Call Buttons (Bottom-Right) */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 flex-col items-end space-y-3">
        
        {/* WhatsApp Popup Card */}
        {showWhatsAppPopup && (
          <div className="bg-[#FAFAF5] rounded-3xl p-5 shadow-2xl border border-[#1B4332]/20 w-80 mb-1 animate-fadeIn text-[#1B4332]">
            <div className="flex items-center justify-between border-b border-[#1B4332]/10 pb-3 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#D8F3DC]" />
                </div>
                <div>
                  <h5 className="font-serif font-bold text-sm text-[#1B4332]">Bahar Retreat WhatsApp</h5>
                  <span className="text-[10px] text-[#40916C] font-semibold flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#40916C] mr-1.5 animate-pulse" />
                    Online Concierge
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppPopup(false)}
                className="text-[#1B4332]/40 hover:text-[#1B4332] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#1B4332]/75 mb-3 leading-relaxed">
              Namaste! How may our hospitality team assist you today?
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleWhatsAppDirect('Hello Bahar Retreat, I would like to check room availability.')}
                className="w-full text-left text-xs bg-[#F1F8E9] hover:bg-[#D8F3DC] p-2.5 rounded-2xl text-[#1B4332] font-semibold transition border border-[#1B4332]/10 cursor-pointer"
              >
                🌿 Check Room Availability
              </button>
              <button
                onClick={() => handleWhatsAppDirect('Hello, please share details and pricing for Ayurvedic Spa packages.')}
                className="w-full text-left text-xs bg-[#F1F8E9] hover:bg-[#D8F3DC] p-2.5 rounded-2xl text-[#1B4332] font-semibold transition border border-[#1B4332]/10 cursor-pointer"
              >
                💆‍♀️ Spa & Wellness Rates
              </button>
              <button
                onClick={() => handleWhatsAppDirect('Hello, I would like assistance with directions to Bahar Retreat.')}
                className="w-full text-left text-xs bg-[#F1F8E9] hover:bg-[#D8F3DC] p-2.5 rounded-2xl text-[#1B4332] font-semibold transition border border-[#1B4332]/10 cursor-pointer"
              >
                📍 Route & Directions Help
              </button>
            </div>
          </div>
        )}

        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-[#D8F3DC] hover:text-white flex items-center justify-center shadow-lg border border-[#40916C]/40 transition cursor-pointer"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        {/* Call Now Floating Button */}
        <a
          id="floating-call-btn"
          href={`tel:${settings.phone || '+919876543210'}`}
          className="group flex items-center space-x-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#D8F3DC] px-4 py-3 rounded-full shadow-2xl border border-[#40916C]/40 transition hover:scale-105 active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#D8F3DC]">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider pr-1 text-white">
            Call Concierge
          </span>
        </a>

        {/* WhatsApp Floating Button */}
        <button
          id="floating-whatsapp-btn"
          onClick={() => setShowWhatsAppPopup(!showWhatsAppPopup)}
          className="group relative flex items-center space-x-2.5 bg-[#40916C] hover:bg-[#52B788] text-white px-4 py-3 rounded-full shadow-2xl transition hover:scale-105 active:scale-95 border border-[#52B788]/40 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider pr-1">
            Chat on WhatsApp
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D8F3DC] rounded-full animate-ping" />
        </button>

      </div>

      {/* Mobile Bottom Fixed Conversion Bar (Book Now | WhatsApp | Call) */}
      <div id="mobile-sticky-bar" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1B4332]/95 backdrop-blur-md border-t border-[#40916C]/30 px-3 py-2 shadow-2xl flex items-center justify-between gap-2">
        
        {/* Call CTA */}
        <a
          id="mobile-bar-call"
          href={`tel:${settings.phone || '+919876543210'}`}
          className="flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-2xl bg-[#2D6A4F] text-[#D8F3DC] text-[11px] font-bold border border-[#40916C]/40 active:scale-95 transition"
        >
          <Phone className="w-4 h-4 mb-0.5 text-[#D8F3DC]" />
          <span>Call Now</span>
        </a>

        {/* WhatsApp CTA */}
        <button
          id="mobile-bar-whatsapp"
          onClick={() => handleWhatsAppDirect()}
          className="flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-2xl bg-[#40916C] text-white text-[11px] font-bold border border-[#52B788]/40 active:scale-95 transition"
        >
          <MessageCircle className="w-4 h-4 mb-0.5 text-white" />
          <span>WhatsApp</span>
        </button>

        {/* Primary Book Now CTA */}
        <button
          id="mobile-bar-book"
          onClick={onOpenBooking}
          className="flex-[1.4] flex items-center justify-center space-x-1.5 py-3 px-3 rounded-full bg-[#D8F3DC] hover:bg-white text-[#1B4332] font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 transition"
        >
          <Calendar className="w-4 h-4 text-[#1B4332]" />
          <span>Book Now</span>
        </button>

      </div>
    </>
  );
};
