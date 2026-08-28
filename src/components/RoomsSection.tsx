import React, { useState } from 'react';
import { Sparkles, Users, Maximize2, Bed, Check, ArrowRight, Eye, Calendar } from 'lucide-react';
import { Room, WebsiteSettings } from '../types.js';

interface RoomsSectionProps {
  rooms: Room[];
  settings: WebsiteSettings;
  onOpenBooking: (roomId: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
  settings,
  onOpenBooking,
}) => {
  const [selectedRoomModal, setSelectedRoomModal] = useState<Room | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const handleOpenDetail = (room: Room) => {
    setSelectedRoomModal(room);
    setActiveImageIdx(0);
  };

  return (
    <section id="rooms-section" className="py-20 lg:py-28 bg-[#FAFAF5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            <span>Luxury Accommodations</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4332]">
            Rooms, Cottages & Forest Villas
          </h2>
          <p className="text-sm sm:text-base text-[#40916C] font-semibold uppercase tracking-wider">
            Refined Living Framed by Pristine Nature
          </p>
          <p className="text-base text-[#1B4332]/75 max-w-2xl mx-auto pt-2">
            Each villa and cottage is thoughtfully crafted with natural woods, expansive private verandas, and panoramic views of untamed nature.
          </p>
          <div className="w-16 h-0.5 bg-[#40916C] mx-auto mt-4" />
        </div>

        {/* Dynamic Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              id={`room-card-${room.id}`}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-[#1B4332]/10 flex flex-col group"
            >
              {/* Card Image Area */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-[#1B4332]">
                <img
                  src={room.featuredImage}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (room.featuredImage.includes('drive.google.com') || room.featuredImage.includes('googleusercontent.com')) {
                      const match = room.featuredImage.match(/[\/=]([a-zA-Z0-9_-]{25,})/);
                      if (match && match[1]) {
                        (e.target as HTMLImageElement).src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                      }
                    }
                  }}
                />
                
                {/* Price Tag Overlay */}
                <div className="absolute top-4 right-4 bg-[#1B4332]/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-[#40916C]/40 shadow-lg text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#D8F3DC] block font-semibold">Starting from</span>
                  <span className="font-serif text-lg sm:text-xl font-bold text-white">
                    {settings.currencySymbol || '₹'}{room.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#D8F3DC]/80"> / night</span>
                </div>

                {/* Status Badge */}
                {room.isAvailable ? (
                  <div className="absolute top-4 left-4 bg-[#40916C]/90 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                    Available for Booking
                  </div>
                ) : (
                  <div className="absolute top-4 left-4 bg-[#2D6A4F]/90 text-[#D8F3DC] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                    Book On Request
                  </div>
                )}
              </div>

              {/* Card Content Area */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-serif text-2xl font-bold text-[#1B4332] group-hover:text-[#40916C] transition">
                      {room.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[#1B4332]/75 line-clamp-2 leading-relaxed">
                    {room.tagline || room.description}
                  </p>
                </div>

                {/* Key Room Specs */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1B4332]/10 text-xs text-[#1B4332] font-medium">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-[#40916C] shrink-0" />
                    <span>Up to {room.capacityAdults} Adults</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Bed className="w-4 h-4 text-[#40916C] shrink-0" />
                    <span className="truncate">{room.bedType}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Maximize2 className="w-4 h-4 text-[#40916C] shrink-0" />
                    <span>{room.sizeSqFt} sq.ft</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 text-xs bg-[#F1F8E9] text-[#1B4332] px-3 py-1 rounded-full border border-[#1B4332]/10"
                    >
                      <Check className="w-3 h-3 text-[#40916C]" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="text-xs text-[#40916C] self-center font-semibold pl-1">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>

                {/* Card CTA Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    id={`view-room-detail-${room.id}`}
                    onClick={() => handleOpenDetail(room)}
                    className="py-2.5 px-3 rounded-full border border-[#1B4332]/25 text-[#1B4332] hover:bg-[#F1F8E9] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#40916C]" />
                    <span>View Details</span>
                  </button>

                  <button
                    id={`book-room-btn-${room.id}`}
                    onClick={() => onOpenBooking(room.id)}
                    className="py-2.5 px-3 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D8F3DC]" />
                    <span>Book Room</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Room Detail Modal Dialog */}
      {selectedRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#1B4332]/10 flex flex-col">
            
            {/* Modal Image Carousel Preview */}
            <div className="relative h-64 sm:h-80 bg-[#1B4332]">
              <img
                src={
                  selectedRoomModal.galleryImages?.[activeImageIdx] ||
                  selectedRoomModal.featuredImage
                }
                alt={selectedRoomModal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const currentSrc = selectedRoomModal.galleryImages?.[activeImageIdx] || selectedRoomModal.featuredImage;
                  if (currentSrc.includes('drive.google.com') || currentSrc.includes('googleusercontent.com')) {
                    const match = currentSrc.match(/[\/=]([a-zA-Z0-9_-]{25,})/);
                    if (match && match[1]) {
                      (e.target as HTMLImageElement).src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                    }
                  }
                }}
              />
              <button
                id="close-room-modal"
                onClick={() => setSelectedRoomModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1B4332]/80 text-white hover:bg-[#1B4332] flex items-center justify-center text-sm font-bold shadow-lg"
              >
                ✕
              </button>

              {/* Thumbnails */}
              {selectedRoomModal.galleryImages && selectedRoomModal.galleryImages.length > 1 && (
                <div className="absolute bottom-3 left-4 right-4 flex space-x-2 overflow-x-auto py-1">
                  {selectedRoomModal.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activeImageIdx === idx ? 'border-[#40916C] scale-105' : 'border-white/60 opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1B4332]/10 pb-4">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332]">
                    {selectedRoomModal.name}
                  </h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332]">
                    {settings.currencySymbol || '₹'}{selectedRoomModal.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#40916C] block">per night + taxes</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-2">
                  About This Accommodation
                </h4>
                <p className="text-sm sm:text-base text-[#1B4332]/80 leading-relaxed">
                  {selectedRoomModal.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFAF5] p-4 rounded-2xl border border-[#1B4332]/10 text-xs text-[#1B4332] font-medium">
                <div>
                  <span className="text-[#40916C] block font-semibold">Adults Capacity</span>
                  <span className="font-bold text-sm">{selectedRoomModal.capacityAdults} Guests</span>
                </div>
                <div>
                  <span className="text-[#40916C] block font-semibold">Bed Setup</span>
                  <span className="font-bold text-sm">{selectedRoomModal.bedType}</span>
                </div>
                <div>
                  <span className="text-[#40916C] block font-semibold">Room Space</span>
                  <span className="font-bold text-sm">{selectedRoomModal.sizeSqFt} sq.ft</span>
                </div>
                <div>
                  <span className="text-[#40916C] block font-semibold">Children</span>
                  <span className="font-bold text-sm">Up to {selectedRoomModal.capacityChildren}</span>
                </div>
              </div>

              {/* All Amenities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-3">
                  Included Luxury Amenities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRoomModal.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs sm:text-sm text-[#1B4332]">
                      <Check className="w-4 h-4 text-[#40916C] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Action CTA */}
              <div className="pt-4 border-t border-[#1B4332]/10 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedRoomModal(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#1B4332] hover:bg-[#F1F8E9] transition"
                >
                  Close
                </button>
                <button
                  id="modal-direct-book-btn"
                  type="button"
                  onClick={() => {
                    const rId = selectedRoomModal.id;
                    setSelectedRoomModal(null);
                    onOpenBooking(rId);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md transition flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4 text-[#D8F3DC]" />
                  <span>Reserve This Villa Now</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};
