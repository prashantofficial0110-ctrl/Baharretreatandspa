import React from 'react';
import { Sparkles, Leaf, HeartHandshake, Trees, Waves, ShieldCheck, ArrowRight } from 'lucide-react';
import { WebsiteSettings } from '../types.js';

interface AboutSectionProps {
  settings: WebsiteSettings;
  onOpenBooking: () => void;
  onExploreSpa: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  settings,
  onOpenBooking,
  onExploreSpa,
}) => {
  const values = [
    {
      icon: Trees,
      title: 'Secluded Nature Immersion',
      desc: 'Sprawling hectares of lush greenery, ancient forest canopies, and bird sanctuaries far removed from bustling city noise.',
    },
    {
      icon: Leaf,
      title: 'Authentic Ayurvedic Healing',
      desc: 'Holistic wellness treatments, natural herbs, pure cold-pressed oils, and personalized restorative rituals guided by skilled therapists.',
    },
    {
      icon: HeartHandshake,
      title: 'Bespoke Hospitality',
      desc: 'Thoughtful, discreet, and warm service tailored to every guest’s unique relaxation needs and personal wellness goals.',
    },
    {
      icon: Waves,
      title: 'Organic Farm-To-Table Dining',
      desc: 'Seasonal gourmet meals crafted with ingredients freshly harvested from nearby orchards and organic local farms.',
    },
  ];

  return (
    <section id="about-section" className="py-20 lg:py-28 bg-[#FAFAF5] relative overflow-hidden">
      
      {/* Decorative nature accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#D8F3DC]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#F1F8E9] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            <span>Discover The Sanctuary</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4332]">
            About Bahar Retreat
          </h2>
          <p className="text-sm sm:text-base text-[#40916C] font-semibold uppercase tracking-wider">
            Our Vision, Heritage & Natural Sanctuary
          </p>
          <div className="w-16 h-0.5 bg-[#40916C] mx-auto mt-4" />
        </div>

        {/* 2-Column Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          
          {/* Left Column: Rich Imagery Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#1B4332]">
              <img
                src="https://lh3.googleusercontent.com/d/1EetXxIQBXd3M0kytBfq34JkA8zysfCm-"
                alt="Bahar Retreat Property Sanctuary"
                className="w-full h-[380px] sm:h-[440px] object-cover hover:scale-105 transition duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1EetXxIQBXd3M0kytBfq34JkA8zysfCm-';
                }}
              />
            </div>
            {/* Overlapping Float Card */}
            <div className="hidden sm:block absolute -bottom-8 -right-6 z-20 w-64 rounded-2xl bg-[#1B4332] text-white p-5 shadow-2xl border border-[#40916C]/40">
              <div className="flex items-center space-x-2 text-[#D8F3DC] text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-[#40916C]" />
                <span>Pure Serenity</span>
              </div>
              <p className="font-serif text-xl font-bold leading-snug">
                An Oasis for Mind, Body & Soul
              </p>
              <p className="text-xs text-white/80 mt-1">
                Surrounded by pristine valleys & birdsong.
              </p>
            </div>
          </div>

          {/* Right Column: Narrative & Philosophy */}
          <div className="lg:col-span-6 space-y-6 text-[#1B4332]">
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#1B4332]">
              Where Time Slows Down and Nature Restores Your Equilibrium
            </h3>
            
            <p className="text-base sm:text-lg text-[#1B4332]/85 leading-relaxed font-normal">
              Nestled harmoniously amidst unspoiled natural landscapes, <strong>Bahar Retreat</strong> is designed as a peaceful haven for travelers seeking deep relaxation, rejuvenation, and holistic wellbeing.
            </p>

            <p className="text-base text-[#1B4332]/80 leading-relaxed font-normal">
              Every detail—from our eco-conscious timber architecture to our fragrant medicinal herb gardens—celebrates the healing power of the natural world. Whether you are reclining on a private forest-view veranda, savoring nutritious farm-to-table delicacies, or undergoing ancestral Ayurvedic therapies, you will find an atmosphere of timeless tranquility.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                id="about-book-btn"
                onClick={onOpenBooking}
                className="px-7 py-3.5 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md transition flex items-center space-x-2 active:scale-95"
              >
                <span>Plan Your Stay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="about-spa-btn"
                onClick={onExploreSpa}
                className="px-7 py-3.5 rounded-full bg-[#F1F8E9] hover:bg-[#D8F3DC] text-[#1B4332] border border-[#1B4332]/10 font-bold text-xs sm:text-sm uppercase tracking-wider transition"
              >
                Explore Spa Therapies
              </button>
            </div>
          </div>

        </div>

        {/* 4 Feature Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                id={`about-value-card-${idx}`}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-[#1B4332]/10 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-full bg-[#F1F8E9] group-hover:bg-[#1B4332] text-[#40916C] group-hover:text-[#D8F3DC] transition flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#1B4332] mb-2">
                  {v.title}
                </h4>
                <p className="text-sm text-[#1B4332]/75 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
