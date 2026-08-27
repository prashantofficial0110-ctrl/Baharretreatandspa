import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Phone, Mail, User, Sparkles, MessageCircle, CheckCircle2, ShieldCheck, Bed, HeartPulse } from 'lucide-react';
import { Room, SpaService, WebsiteSettings } from '../types.js';
import { api } from '../services/api.js';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  services: SpaService[];
  settings: WebsiteSettings;
  initialRoomId?: string;
  initialServiceId?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  onNavigateToAdmin?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  rooms,
  services,
  settings,
  initialRoomId,
  initialServiceId,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  onNavigateToAdmin,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState(initialCheckIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut || tomorrowStr);
  const [adults, setAdults] = useState<number>(initialAdults || 2);
  const [children, setChildren] = useState<number>(0);
  const [roomId, setRoomId] = useState<string>(initialRoomId || '');
  const [serviceId, setServiceId] = useState<string>(initialServiceId || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationData, setConfirmationData] = useState<{
    id: string;
    bookingRef: string;
    guestName: string;
    guestPhone?: string;
    guestEmail?: string;
    checkInDate: string;
    checkOutDate: string;
    roomName: string;
    serviceName?: string;
    totalAmount?: number;
    adults?: number;
    children?: number;
    specialRequests?: string;
  } | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialRoomId) setRoomId(initialRoomId);
    if (initialServiceId) setServiceId(initialServiceId);
    if (initialCheckIn) setCheckInDate(initialCheckIn);
    if (initialCheckOut) setCheckOutDate(initialCheckOut);
    if (initialAdults) setAdults(initialAdults);
  }, [initialRoomId, initialServiceId, initialCheckIn, initialCheckOut, initialAdults]);

  if (!isOpen) return null;

  // Estimate total
  const selectedRoom = rooms.find((r) => r.id === roomId);
  const selectedService = services.find((s) => s.id === serviceId);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const inD = new Date(checkInDate);
    const outD = new Date(checkOutDate);
    if (outD <= inD) return 1;
    return Math.max(1, Math.ceil((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const estimatedRoomTotal = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const estimatedServiceTotal = selectedService ? selectedService.price : 0;
  const estimatedGrandTotal = estimatedRoomTotal + estimatedServiceTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Date validation
    const inD = new Date(checkInDate);
    const outD = new Date(checkOutDate);
    if (outD <= inD) {
      setErrorMsg('Check-out date must be strictly after the check-in date.');
      return;
    }

    if (!guestName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!guestPhone.trim() || guestPhone.trim().length < 7) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }

    if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createBooking({
        guestName,
        guestPhone,
        guestEmail,
        checkInDate,
        checkOutDate,
        adults,
        children,
        roomId: roomId || undefined,
        serviceId: serviceId || undefined,
        specialRequests,
        source: 'website',
      });

      setConfirmationData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppBookingNotification = () => {
    if (!confirmationData) return;
    const cleanPhone = (settings.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello Bahar Retreat And Spa (बाहर रिट्रीट एंड स्पा),\n\nI have submitted a booking request on your website.\n\n` +
      `• Booking Ref: ${confirmationData.bookingRef}\n` +
      `• Guest Name: ${confirmationData.guestName}\n` +
      `• Check-In: ${confirmationData.checkInDate}\n` +
      `• Check-Out: ${confirmationData.checkOutDate}\n` +
      `• Room/Villa: ${confirmationData.roomName}\n\n` +
      `Please confirm the availability and reservation details.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="booking-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1B4332]/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div className="bg-[#FAFAF5] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#1B4332]/20 flex flex-col relative my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#1B4332] text-white p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[#2D6A4F]/30 rounded-full blur-2xl" />
          <button
            id="close-booking-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#2D6A4F]/80 hover:bg-[#40916C] text-[#D8F3DC] hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-start space-x-4">
            <div className="w-14 h-14 rounded-full bg-white border border-[#52B788]/40 p-1 shadow-md overflow-hidden shrink-0 hidden sm:flex items-center justify-center">
              <img
                src={settings.logoUrl || 'https://lh3.googleusercontent.com/d/1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC'}
                alt="Bahar Retreat And Spa Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1zci6HGTHjB_RbnE3XzedqpIyqZJCGTFC';
                }}
              />
            </div>
            <div className="space-y-1.5 flex-1 pr-8">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#2D6A4F] text-[#D8F3DC] text-[11px] font-bold uppercase tracking-wider border border-[#52B788]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct Reservation Portal</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                {confirmationData ? 'Booking Enquiry Received' : 'Reserve Your Sanctuary Stay'}
              </h3>
              <p className="text-xs sm:text-sm text-[#D8F3DC]/85">
                {confirmationData
                  ? 'बाहर रिट्रीट एंड स्पा में आपकी बुकिंग का अनुरोध सफलतापूर्वक दर्ज किया गया है।'
                  : 'Bahar Retreat And Spa (बाहर रिट्रीट एंड स्पा) • Best Direct Rate Guaranteed'}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Screen */}
        {confirmationData ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-full bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#2D6A4F]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#40916C]">
                Reservation Reference Number
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#1B4332] bg-[#F1F8E9] py-3 px-6 rounded-2xl border border-[#1B4332]/15 inline-block shadow-sm">
                {confirmationData.bookingRef}
              </div>
            </div>

            <p className="text-sm text-[#1B4332]/85 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{confirmationData.guestName}</strong>! Our reservation concierge has received your stay request for <strong>{confirmationData.roomName}</strong> from <strong>{confirmationData.checkInDate}</strong> to <strong>{confirmationData.checkOutDate}</strong>.
            </p>

            {/* Reservation Summary Card */}
            <div className="bg-[#F1F8E9] p-4 sm:p-5 rounded-2xl border border-[#1B4332]/15 text-left text-xs sm:text-sm space-y-3 max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#40916C] font-bold block uppercase text-[10px]">Guest Name</span>
                  <span className="font-bold text-[#1B4332]">{confirmationData.guestName}</span>
                </div>
                <div>
                  <span className="text-[#40916C] font-bold block uppercase text-[10px]">Room / Villa</span>
                  <span className="font-semibold text-[#1B4332]">{confirmationData.roomName}</span>
                </div>
                <div>
                  <span className="text-[#40916C] font-bold block uppercase text-[10px]">Check-In / Out</span>
                  <span className="font-medium text-[#1B4332]">{confirmationData.checkInDate} → {confirmationData.checkOutDate}</span>
                </div>
                {confirmationData.totalAmount ? (
                  <div>
                    <span className="text-[#40916C] font-bold block uppercase text-[10px]">Estimated Total</span>
                    <span className="font-bold text-[#1B4332]">₹{confirmationData.totalAmount.toLocaleString()}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Quick Conversion CTA buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                id="booking-confirm-whatsapp-btn"
                onClick={handleWhatsAppBookingNotification}
                className="py-3 px-4 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#D8F3DC]" />
                <span>Confirm via WhatsApp</span>
              </button>

              <a
                id="booking-confirm-call-btn"
                href={`tel:${settings.phone || '+919876543210'}`}
                className="py-3 px-4 rounded-full bg-[#F1F8E9] hover:bg-[#D8F3DC] text-[#1B4332] border border-[#1B4332]/15 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm transition flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-[#40916C]" />
                <span>Call Concierge Now</span>
              </a>
            </div>

            {/* Owner Shortcut Option */}
            {onNavigateToAdmin && (
              <div className="p-3 bg-white rounded-2xl border border-[#1B4332]/10 max-w-md mx-auto flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#40916C] block">
                    Resort Management View
                  </span>
                  <span className="text-xs font-semibold text-[#1B4332]">
                    Verify booking in Owner Portal?
                  </span>
                </div>
                <button
                  id="view-in-owner-portal-btn"
                  onClick={() => {
                    setConfirmationData(null);
                    onClose();
                    onNavigateToAdmin();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition flex items-center space-x-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Owner Portal</span>
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-[#1B4332]/10 text-xs text-[#1B4332]/70">
              A copy of your booking request has been securely recorded in the resort management database.
            </div>

            <button
              onClick={() => {
                setConfirmationData(null);
                onClose();
              }}
              className="mt-1 text-xs font-semibold text-[#40916C] hover:text-[#1B4332] hover:underline cursor-pointer"
            >
              Done & Close Window
            </button>

          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* Guest Contact Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] border-b border-[#1B4332]/10 pb-2">
                1. Guest Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#40916C] absolute left-3.5 top-3.5" />
                    <input
                      id="booking-fullname"
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#40916C] absolute left-3.5 top-3.5" />
                    <input
                      id="booking-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#40916C] absolute left-3.5 top-3.5" />
                    <input
                      id="booking-email"
                      type="email"
                      placeholder="vikram@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#1B4332]/15 rounded-2xl text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Dates & Guests */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] border-b border-[#1B4332]/10 pb-2">
                2. Stay Dates & Party Size
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* Check In */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Check-in Date *
                  </label>
                  <input
                    id="booking-checkin"
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#1B4332]/15 rounded-2xl text-xs sm:text-sm text-[#1B4332] font-medium focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                  />
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Check-out Date *
                  </label>
                  <input
                    id="booking-checkout"
                    type="date"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#1B4332]/15 rounded-2xl text-xs sm:text-sm text-[#1B4332] font-medium focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                  />
                </div>

                {/* Adults */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Adults (12+ yrs) *
                  </label>
                  <select
                    id="booking-adults"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#1B4332]/15 rounded-2xl text-xs sm:text-sm text-[#1B4332] font-medium focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Adult' : 'Adults'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Children */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                    Children (0-11 yrs)
                  </label>
                  <select
                    id="booking-children"
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#1B4332]/15 rounded-2xl text-xs sm:text-sm text-[#1B4332] font-medium focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Child' : 'Children'}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Accommodation & Spa Selection */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] border-b border-[#1B4332]/10 pb-2">
                3. Room & Treatment Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Room */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5 flex items-center space-x-1">
                    <Bed className="w-3.5 h-3.5 text-[#40916C]" />
                    <span>Select Room / Villa</span>
                  </label>
                  <select
                    id="booking-room"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border border-[#1B4332]/15 rounded-2xl text-xs sm:text-sm text-[#1B4332] font-medium focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                  >
                    <option value="">General / Let Resort Recommend</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({settings.currencySymbol || '₹'}{r.pricePerNight.toLocaleString()}/night)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Spa Service */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5 flex items-center space-x-1">
                    <HeartPulse className="w-3.5 h-3.5 text-[#40916C]" />
                    <span>Optional Spa Package</span>
                  </label>
                  <select
                    id="booking-service"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border border-[#1B4332]/15 rounded-2xl text-xs sm:text-sm text-[#1B4332] font-medium focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none transition"
                  >
                    <option value="">No Spa Package / Decide on Arrival</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({settings.currencySymbol || '₹'}{s.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Special Requests & Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1.5">
                Special Requests / Dietary Requirements / Arrival Time
              </label>
              <textarea
                id="booking-requests"
                rows={2}
                placeholder="e.g. Vegetarian meal request, anniversary celebration setup, late check-in around 6 PM..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full p-3.5 bg-white border border-[#1B4332]/15 rounded-2xl text-xs sm:text-sm text-[#1B4332] focus:border-[#40916C] focus:ring-2 focus:ring-[#D8F3DC] focus:outline-none resize-none transition"
              />
            </div>

            {/* Estimated Total Summary */}
            {estimatedGrandTotal > 0 && (
              <div className="bg-[#D8F3DC]/40 p-4 rounded-2xl border border-[#40916C]/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] block">
                    Estimated Booking Total ({nights} {nights === 1 ? 'Night' : 'Nights'})
                  </span>
                  <span className="text-[11px] text-[#2D6A4F]">
                    {selectedRoom ? selectedRoom.name : ''} {selectedService ? `+ ${selectedService.name}` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-[#1B4332]">
                    {settings.currencySymbol || '₹'}{estimatedGrandTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#40916C] block">No advance payment charged now</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="booking-submit-request-btn"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-[#1B4332]/40 text-white font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl transition active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <span>Processing Reservation...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D8F3DC]" />
                    <span>Submit Booking Request</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-[11px] text-[#1B4332]/70 mt-2.5">
                🔒 Your personal information is encrypted and confidential. We will confirm via WhatsApp & Call.
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
