import React, { useState } from 'react';
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { GalleryItem } from '../types.js';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'property', label: 'Property & Views' },
    { id: 'rooms', label: 'Rooms & Villas' },
    { id: 'spa', label: 'Spa & Wellness' },
    { id: 'dining', label: 'Organic Dining' },
    { id: 'nature', label: 'Flora & Trails' },
  ];

  const filteredItems = activeCategory === 'all'
    ? gallery
    : gallery.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  return (
    <section id="gallery-section" className="py-20 lg:py-28 bg-[#FAFAF5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            <span>Visual Tour</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4332]">
            Moments at Bahar Retreat
          </h2>
          <p className="text-sm sm:text-base text-[#40916C] font-semibold uppercase tracking-wider">
            Glimpses of Tranquility & Natural Splendor
          </p>
          <p className="text-base text-[#1B4332]/75 max-w-2xl mx-auto pt-2">
            Explore glimpses of our architecture, Ayurvedic treatment spaces, lush valley vistas, and wholesome culinary experiences.
          </p>
          <div className="w-16 h-0.5 bg-[#40916C] mx-auto mt-4" />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                activeCategory === cat.id
                  ? 'bg-[#1B4332] text-white shadow-md'
                  : 'bg-[#F1F8E9] text-[#1B4332] hover:bg-[#D8F3DC] border border-[#1B4332]/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry / Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              id={`gallery-item-${item.id}`}
              onClick={() => handleOpenLightbox(index)}
              className={`group relative overflow-hidden rounded-3xl cursor-pointer bg-[#1B4332] shadow-sm hover:shadow-2xl transition duration-500 border border-[#1B4332]/10 ${
                index % 5 === 0 ? 'sm:col-span-2 sm:row-span-2 h-[340px] sm:h-[440px]' : 'h-60 sm:h-72'
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.altText || item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-95 group-hover:opacity-100"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (item.imageUrl.includes('drive.google.com') || item.imageUrl.includes('googleusercontent.com')) {
                    const match = item.imageUrl.match(/[\/=]([a-zA-Z0-9_-]{25,})/);
                    if (match && match[1]) {
                      (e.target as HTMLImageElement).src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                    }
                  }
                }}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/95 via-[#1B4332]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8F3DC] block">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-xs text-[#D8F3DC]/80 mt-1 line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#40916C] flex items-center justify-center text-white shrink-0 ml-3 shadow-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-[#1B4332]">
            <ImageIcon className="w-12 h-12 mx-auto text-[#40916C] mb-3" />
            <p className="font-medium">No images found in this category.</p>
          </div>
        )}

      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          id="gallery-lightbox-modal"
          onClick={handleCloseLightbox}
          className="fixed inset-0 z-50 bg-[#1B4332]/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
        >
          {/* Close Button */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {filteredItems.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Next Image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Main Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center relative"
          >
            <img
              src={filteredItems[lightboxIndex].imageUrl}
              alt={filteredItems[lightboxIndex].altText || filteredItems[lightboxIndex].title}
              className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            
            <div className="mt-4 text-center text-white max-w-xl">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#D8F3DC]">
                {filteredItems[lightboxIndex].title}
              </h3>
              {filteredItems[lightboxIndex].caption && (
                <p className="text-sm text-white/80 mt-1">
                  {filteredItems[lightboxIndex].caption}
                </p>
              )}
              <span className="text-xs text-[#D8F3DC]/70 mt-2 block">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
