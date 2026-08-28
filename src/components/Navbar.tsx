import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Calendar, Menu, X, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { WebsiteSettings, PageView } from '../types.js';

interface NavbarProps {
  settings: WebsiteSettings;
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  onOpenBooking: (roomId?: string, serviceId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activePage,
  setActivePage,
  onOpenBooking,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string; page: PageView }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About Us', page: 'about' },
    { label: 'Rooms & Villas', page: 'rooms' },
    { label: 'Spa & Wellness', page: 'spa' },
    { label: 'Facilities', page: 'facilities' },
    { label: 'Gallery', page: 'gallery' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleNavClick = (page: PageView) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = () => {
    const cleanPhone = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello Bahar Retreat, I would like to enquire about room availability and spa packages.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || activePage !== 'home'
          ? 'bg-white/95 backdrop-blur-md text-[#1B4332] shadow-sm border-b border-[#1B4332]/10 py-3'
          : 'bg-white text-[#1B4332] border-b border-[#1B4332]/10 shadow-sm py-3.5 sm:py-4'
      }`}
    >
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Identity */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-[#1B4332]/15 flex items-center justify-center p-1 shadow-sm overflow-hidden group-hover:border-[#2D6A4F] group-hover:shadow-md transition duration-300 shrink-0">
              <img
                src={settings.logoUrl || 'https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC'}
                alt="Bahar Retreat Official Logo"
                className="w-full h-full object-contain transform group-hover:scale-105 transition duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#1B4332] group-hover:text-[#2D6A4F] transition">
                {settings.businessName || 'BAHAR RETREAT'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#40916C] tracking-widest uppercase">
                Luxury Resort & Wellness Sanctuary
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 uppercase text-[11px] font-bold tracking-widest text-[#1B4332]">
            {navLinks.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  id={`nav-link-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`transition-all duration-200 py-1 ${
                    isActive
                      ? 'text-[#1B4332] border-b-2 border-[#1B4332] font-extrabold'
                      : 'text-[#1B4332]/80 hover:text-[#40916C]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Quick Action CTAs */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Owner Login Link */}
            <button
              id="nav-owner-login-btn"
              onClick={() => handleNavClick('admin')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#1B4332] bg-[#F1F8E9] hover:bg-[#D8F3DC] border border-[#1B4332]/10 transition"
              title="Owner & Staff Booking Management"
            >
              <Shield className="w-3 h-3 text-[#2D6A4F]" />
              <span>Owner Portal</span>
            </button>

            {/* Call button */}
            <a
              id="nav-call-btn"
              href={`tel:${settings.phone || '+919876543210'}`}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#F1F8E9] hover:bg-[#D8F3DC] text-[#1B4332] border border-[#1B4332]/10 transition shadow-sm"
              title="Call Reception"
            >
              <Phone className="w-3.5 h-3.5 text-[#40916C]" />
              <span className="hidden xl:inline">{settings.phone || '+91 98765 43210'}</span>
              <span className="xl:hidden">Call</span>
            </a>

            {/* WhatsApp CTA */}
            <button
              id="nav-whatsapp-btn"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Primary Book Now CTA */}
            <button
              id="nav-book-now-btn"
              onClick={() => onOpenBooking()}
              className="inline-flex items-center space-x-1.5 bg-[#1B4332] text-white px-5 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-wider hover:bg-[#2D6A4F] transition-colors shadow-md active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Now</span>
            </button>
          </div>

          {/* Mobile Hamburger & Quick CTA */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              id="mobile-nav-book-btn"
              onClick={() => onOpenBooking()}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1B4332] text-white rounded-full"
            >
              Book
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1B4332] hover:bg-[#1B4332]/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-white border-b border-[#1B4332]/10 px-4 pt-3 pb-6 space-y-2 mt-3 shadow-xl animate-fadeIn text-[#1B4332]">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  id={`mobile-link-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#F1F8E9] text-[#1B4332] border-l-4 border-[#1B4332]'
                      : 'text-[#1B4332]/80 hover:bg-[#FAFAF5]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#40916C]" />
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#1B4332]/10 space-y-2.5">
            <button
              id="mobile-drawer-book-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs uppercase tracking-wider shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>BOOK NOW</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="mobile-drawer-whatsapp-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleWhatsAppClick();
                }}
                className="flex items-center justify-center space-x-2 py-2.5 rounded-full bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-bold shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <a
                id="mobile-drawer-call-btn"
                href={`tel:${settings.phone || '+919876543210'}`}
                className="flex items-center justify-center space-x-2 py-2.5 rounded-full bg-[#F1F8E9] border border-[#1B4332]/15 text-[#1B4332] text-xs font-bold"
              >
                <Phone className="w-4 h-4 text-[#40916C]" />
                <span>Call Concierge</span>
              </a>
            </div>

            <div className="pt-2 text-center">
              <button
                id="mobile-admin-access-btn"
                onClick={() => handleNavClick('admin')}
                className="inline-flex items-center space-x-1.5 text-xs text-[#40916C] hover:text-[#1B4332] font-semibold"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Owner / Staff Login</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
