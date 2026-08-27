import React from 'react';
import { Sparkles, Waves, UtensilsCrossed, Sun, Flame, Wifi, Trees, ShieldCheck, HeartPulse } from 'lucide-react';
import { Facility } from '../types.js';

interface FacilitiesSectionProps {
  facilities: Facility[];
  onOpenBooking: () => void;
}

export const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({
  facilities,
  onOpenBooking,
}) => {
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'waves':
      case 'pool':
        return Waves;
      case 'utensilscrossed':
      case 'dining':
      case 'restaurant':
        return UtensilsCrossed;
      case 'sun':
      case 'yoga':
        return Sun;
      case 'flame':
      case 'bonfire':
        return Flame;
      case 'wifi':
        return Wifi;
      case 'trees':
      case 'nature':
        return Trees;
      case 'heartpulse':
      case 'spa':
        return HeartPulse;
      default:
        return Sparkles;
    }
  };

  return (
    <section id="facilities-section" className="py-20 lg:py-28 bg-[#1B4332] text-white relative overflow-hidden">
      
      {/* Subtle Background Matrix Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#2D6A4F] text-[#D8F3DC] border border-[#52B788]/30 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#D8F3DC]" />
            <span>Resort Amenities & Comforts</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Signature Resort Facilities
          </h2>
          <p className="font-serif text-xl sm:text-2xl text-[#D8F3DC] font-medium">
            अतिथि सुविधाएं एवं प्रकृति के संग जीवन
          </p>
          <p className="text-base text-white/80 max-w-2xl mx-auto pt-2 font-normal">
            Every amenity at Bahar Retreat is designed to foster relaxation, mindfulness, and effortless living in natural tranquility.
          </p>
          <div className="w-16 h-0.5 bg-[#40916C] mx-auto mt-4" />
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility) => {
            const Icon = getIcon(facility.iconName);
            return (
              <div
                key={facility.id}
                id={`facility-card-${facility.id}`}
                className="bg-[#2D6A4F]/40 backdrop-blur-md rounded-3xl overflow-hidden border border-[#40916C]/30 hover:border-[#52B788]/60 transition-all duration-300 hover:-translate-y-1 group flex flex-col shadow-lg"
              >
                {facility.image && (
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332] via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-[#1B4332]/90 backdrop-blur-md text-[#D8F3DC] flex items-center justify-center border border-[#40916C]/40">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {!facility.image && (
                      <div className="w-12 h-12 rounded-full bg-[#2D6A4F] text-[#D8F3DC] flex items-center justify-center mb-4 border border-[#40916C]/40">
                        <Icon className="w-6 h-6" />
                      </div>
                    )}
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#D8F3DC] transition">
                      {facility.name}
                    </h3>
                    {facility.hindiName && (
                      <p className="text-xs text-[#D8F3DC]/80 font-medium mb-2">
                        {facility.hindiName}
                      </p>
                    )}
                    <p className="text-sm text-white/75 leading-relaxed">
                      {facility.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-16 bg-[#2D6A4F]/30 border border-[#40916C]/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#40916C]/40 border border-[#52B788]/40 flex items-center justify-center text-[#D8F3DC] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
                Looking for Custom Group or Corporate Retreats?
              </h4>
              <p className="text-xs sm:text-sm text-[#D8F3DC]/80">
                We offer exclusive whole-property bookings, specialized yoga retreats, and curated wellness itineraries.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBooking}
            className="px-7 py-3.5 rounded-full bg-[#D8F3DC] hover:bg-white text-[#1B4332] font-bold text-xs sm:text-sm tracking-wider uppercase shrink-0 transition shadow-lg active:scale-95"
          >
            Inquire Group Stay
          </button>
        </div>

      </div>
    </section>
  );
};
