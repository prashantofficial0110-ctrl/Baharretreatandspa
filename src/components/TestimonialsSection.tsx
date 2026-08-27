import React from 'react';
import { Sparkles, Star, Quote, ShieldCheck, MapPin } from 'lucide-react';
import { Testimonial } from '../types.js';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  return (
    <section id="testimonials-section" className="py-20 lg:py-28 bg-[#1B4332] text-white relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2D6A4F]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#2D6A4F] text-[#D8F3DC] text-[11px] font-bold uppercase tracking-[0.2em] border border-[#52B788]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#D8F3DC]" />
            <span>Verified Google Maps Reviews</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Words From Our Honored Guests
          </h2>
          <p className="font-serif text-xl sm:text-2xl text-[#D8F3DC] font-medium">
            अतिथियों के वास्तविक संस्मरण एवं अनुभव
          </p>
          <div className="flex items-center justify-center space-x-2 pt-2 text-[#D8F3DC] text-sm">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#52B788] text-[#52B788]" />
              ))}
            </div>
            <span className="font-bold text-white">4.7 / 5.0</span>
            <span className="text-[#D8F3DC]/70">• Google Maps Verified Rating (Gangtok, Sikkim)</span>
          </div>
          <div className="w-16 h-0.5 bg-[#40916C] mx-auto mt-4" />
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              id={`testimonial-card-${item.id}`}
              className="bg-[#2D6A4F]/30 backdrop-blur-md rounded-3xl p-7 border border-[#40916C]/30 shadow-xl flex flex-col justify-between hover:border-[#52B788]/60 transition duration-300 group"
            >
              <div className="space-y-4">
                
                {/* Top Quote Icon & Stars */}
                <div className="flex items-center justify-between">
                  <Quote className="w-8 h-8 text-[#52B788]/40" />
                  <div className="flex items-center space-x-1 text-[#D8F3DC]">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#52B788] text-[#52B788]" />
                    ))}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-white/95 italic leading-relaxed font-normal">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#40916C]/30 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                    {item.guestName}
                  </h3>
                  <p className="text-xs text-[#D8F3DC]/80 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#52B788]" />
                    {item.guestLocation}
                  </p>
                </div>
                {item.stayType && (
                  <span className="text-[10px] bg-[#1B4332] text-[#D8F3DC] px-3 py-1 rounded-full border border-[#40916C]/40 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#52B788]" />
                    {item.stayType}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-14 text-center text-xs text-[#D8F3DC]/80 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#52B788]" />
          <span className="tracking-wide">Real Google Maps Reviews • Bahar Retreat And Spa, Development Area, Gangtok, Sikkim</span>
        </div>

      </div>
    </section>
  );
};
