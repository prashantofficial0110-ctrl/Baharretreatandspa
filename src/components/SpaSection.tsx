import React, { useState } from 'react';
import { Sparkles, Clock, CheckCircle2, Calendar, Heart, Shield, ArrowRight } from 'lucide-react';
import { SpaService, WebsiteSettings } from '../types.js';

interface SpaSectionProps {
  services: SpaService[];
  settings: WebsiteSettings;
  onOpenBooking: (roomId?: string, serviceId?: string) => void;
}

export const SpaSection: React.FC<SpaSectionProps> = ({
  services,
  settings,
  onOpenBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Ayurveda', 'Massage', 'Facial', 'Yoga & Meditation', 'Body Rituals'];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="spa-section" className="py-20 lg:py-28 bg-[#FAFAF5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            <span>Holistic Wellness & Ayurveda</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4332]">
            Bahar Rejuvenation & Views
          </h2>
          <p className="text-sm sm:text-base text-[#40916C] font-semibold uppercase tracking-wider">
            Ayurvedic Therapies & Complete Mind-Body Renewal
          </p>
          <p className="text-base text-[#1B4332]/75 max-w-2xl mx-auto pt-2">
            Ancient therapeutic wisdom combined with pure botanical oils, warm herbal compresses, and meditative stillness.
          </p>
          <div className="w-16 h-0.5 bg-[#40916C] mx-auto mt-4" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                selectedCategory === cat
                  ? 'bg-[#1B4332] text-white shadow-md'
                  : 'bg-[#F1F8E9] text-[#1B4332] hover:bg-[#D8F3DC] border border-[#1B4332]/10'
              }`}
            >
              {cat === 'all' ? 'All Treatments' : cat}
            </button>
          ))}
        </div>

        {/* Spa Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-[#1B4332]/10 flex flex-col group"
            >
              {/* Photo & Duration Badge */}
              <div className="relative h-56 overflow-hidden bg-[#1B4332]">
                <img
                  src={service.featuredImage}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  loading="lazy"
                />
                <div className="absolute top-3.5 left-3.5 bg-[#1B4332]/90 backdrop-blur-md text-[#D8F3DC] text-xs font-semibold px-3.5 py-1 rounded-full flex items-center space-x-1.5 border border-[#40916C]/40">
                  <Clock className="w-3.5 h-3.5 text-[#40916C]" />
                  <span>{service.durationMinutes} Minutes</span>
                </div>
                <div className="absolute top-3.5 right-3.5 bg-[#40916C]/90 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  {service.category}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-serif text-xl font-bold text-[#1B4332] group-hover:text-[#40916C] transition">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1B4332]/75 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Benefits List */}
                {service.benefits && service.benefits.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#1B4332]/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B4332] block">
                      Key Healing Benefits
                    </span>
                    {service.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start space-x-2 text-xs text-[#1B4332]/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#40916C] shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price & Book Treatment CTA */}
                <div className="pt-3.5 border-t border-[#1B4332]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#40916C] uppercase tracking-wider block font-semibold">Investment</span>
                    <span className="font-serif text-xl font-bold text-[#1B4332]">
                      {settings.currencySymbol || '₹'}{service.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    id={`book-spa-btn-${service.id}`}
                    onClick={() => onOpenBooking(undefined, service.id)}
                    className="px-5 py-2.5 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center space-x-1.5 active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D8F3DC]" />
                    <span>Book Session</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
