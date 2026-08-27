import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock, Sparkles, Navigation } from 'lucide-react';
import { WebsiteSettings } from '../types.js';
import { api } from '../services/api.js';

interface ContactSectionProps {
  settings: WebsiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please enter your enquiry message.');
      return;
    }

    setLoading(true);
    try {
      await api.createEnquiry({
        name,
        phone,
        email,
        subject: subject || 'General Enquiry',
        message,
      });
      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const cleanPhone = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello Bahar Retreat And Spa (बाहर रिट्रीट एंड स्पा), I would like to get in touch regarding a general enquiry.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contact-section" className="py-20 lg:py-28 bg-[#FAFAF5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            <span>Concierge & Inquiries</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4332]">
            Contact Bahar Retreat And Spa
          </h2>
          <p className="font-serif text-xl sm:text-2xl text-[#40916C] font-medium">
            संपर्क एवं मार्ग दर्शन
          </p>
          <p className="text-base text-[#1B4332]/75 max-w-2xl mx-auto pt-2">
            Reach out to our front desk team for room bookings, customized wellness itineraries, route assistance, or dining reservations.
          </p>
          <div className="w-16 h-0.5 bg-[#40916C] mx-auto mt-4" />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Direct Contact Details & Google Maps */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#1B4332] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-[#40916C]/30">
              <h3 className="font-serif text-2xl font-bold text-[#D8F3DC]">
                Direct Communication Channels
              </h3>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-[#D8F3DC] flex items-center justify-center shrink-0 border border-[#40916C]/40">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#D8F3DC] uppercase tracking-wider block font-semibold">
                      Telephone / Reception
                    </span>
                    <a
                      href={`tel:${settings.phone || '+919854936290'}`}
                      className="text-base font-bold text-white hover:text-[#D8F3DC] transition"
                    >
                      {settings.phone || '+91 9854936290'}
                    </a>
                    {settings.secondaryPhone && (
                      <a
                        href={`tel:${settings.secondaryPhone}`}
                        className="text-sm font-medium text-white/80 block hover:text-white"
                      >
                        {settings.secondaryPhone}
                      </a>
                    )}
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-[#D8F3DC] flex items-center justify-center shrink-0 border border-[#40916C]/40">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#D8F3DC] uppercase tracking-wider block font-semibold">
                      WhatsApp Concierge
                    </span>
                    <button
                      onClick={handleWhatsApp}
                      className="text-base font-bold text-white hover:text-[#D8F3DC] transition text-left cursor-pointer"
                    >
                      {settings.whatsappNumber || '+91 98765 43210'}
                    </button>
                    <span className="text-xs text-white/70 block">
                      Quick reply within minutes
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-[#D8F3DC] flex items-center justify-center shrink-0 border border-[#40916C]/40">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#D8F3DC] uppercase tracking-wider block font-semibold">
                      Official Email
                    </span>
                    <a
                      href={`mailto:${settings.email || 'stay@baharretreat.com'}`}
                      className="text-base font-semibold text-white hover:text-[#D8F3DC] transition"
                    >
                      {settings.email || 'stay@baharretreat.com'}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-[#D8F3DC] flex items-center justify-center shrink-0 border border-[#40916C]/40">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#D8F3DC] uppercase tracking-wider block font-semibold">
                      Property Location
                    </span>
                    <p className="text-sm text-white/90 font-medium leading-relaxed">
                      {settings.address || 'Development Area,Near Pushpa Garage,Gangtok,Sikkim,India- 737101'}
                    </p>
                    {settings.addressHindi && (
                      <p className="text-xs text-[#D8F3DC]/80 mt-1">
                        {settings.addressHindi}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-[#D8F3DC] flex items-center justify-center shrink-0 border border-[#40916C]/40">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#D8F3DC] uppercase tracking-wider block font-semibold">
                      Timings & Check-in
                    </span>
                    <p className="text-xs text-white/80">
                      Check-in: <strong>{settings.checkInTime || '14:00'}</strong> • Check-out: <strong>{settings.checkOutTime || '11:00'}</strong>
                    </p>
                    <p className="text-xs text-[#D8F3DC]/70">
                      Front Desk Reception: 24 Hours Open
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Google Maps Embed Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#1B4332]/10 p-2">
              <div className="h-56 sm:h-64 rounded-2xl overflow-hidden relative bg-[#F1F8E9]">
                <iframe
                  title="Bahar Retreat And Spa Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110000!2d78.0!3d30.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDE4JzAwLjAiTiA3OMKwMDAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-[#1B4332] font-semibold flex items-center space-x-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#40916C]" />
                  <span>Google Maps Location</span>
                </span>
                <a
                  href={settings.googleMapsUrl || 'https://maps.google.com/?q=Bahar+Retreat+And+Spa'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#40916C] hover:text-[#1B4332] underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Contact Enquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#1B4332]/10">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332] mb-2">
              Send an Enquiry or Message
            </h3>
            <p className="text-sm text-[#1B4332]/70 mb-6">
              Fill in your details below and our team will get back to you promptly via call or WhatsApp.
            </p>

            {success ? (
              <div className="p-8 rounded-3xl bg-[#FAFAF5] border border-[#40916C]/30 text-center space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-[#1B4332] text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8 text-[#D8F3DC]" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1B4332]">
                  Enquiry Submitted Successfully!
                </h4>
                <p className="text-sm text-[#1B4332]/80 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to <strong>Bahar Retreat And Spa (बाहर रिट्रीट एंड स्पा)</strong>. A representative from our hospitality desk will contact you shortly.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider transition shadow"
                  >
                    Send Another Message
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="px-6 py-2.5 rounded-full bg-[#F1F8E9] hover:bg-[#D8F3DC] text-[#1B4332] border border-[#1B4332]/10 text-xs font-bold uppercase tracking-wider transition"
                  >
                    WhatsApp Us
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Ankit Mehra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="ankit@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="e.g. Wedding enquiry / Group booking"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Your Message / Requirements *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Tell us how we can help you with your stay, dates, or wellness treatment..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full p-4 bg-[#FAFAF5] border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none resize-none transition"
                  />
                </div>

                {/* Submit Button */}
                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-[#1B4332]/40 text-white font-bold text-xs uppercase tracking-widest shadow-lg transition flex items-center justify-center space-x-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D8F3DC]" />
                      <span>Send Enquiry to Front Desk</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
