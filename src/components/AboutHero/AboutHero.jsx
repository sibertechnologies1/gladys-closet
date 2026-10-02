import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getSiteContent } from '../../lib/content';

const LOCAL_STORAGE_KEY = "cached_about_hero_slides";

export default function AboutHero() {
  // Read cached slides synchronously on mount
  const [slides, setSlides] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(() => slides.length === 0);

  useEffect(() => {
    let isMounted = true;

    async function loadSlides() {
      try {
        const data = await getSiteContent();
        if (data?.about_hero_slides) {
          const parsed = JSON.parse(data.about_hero_slides);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

            await Promise.all(
              parsed.map((slide) => {
                return new Promise((resolve) => {
                  if (!slide.image) return resolve();
                  const img = new Image();
                  img.src = slide.image;
                  img.onload = resolve;
                  img.onerror = resolve;
                });
              })
            );

            if (isMounted) {
              setSlides(parsed);
            }
          }
        }
      } catch (e) {
        console.error('Error loading about hero slides:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  if (loading && slides.length === 0) {
    return <div className="w-full h-[450px] sm:h-[550px]" />;
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title || 'About Banner'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            className="w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-900/60 to-black/40" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="max-w-2xl text-purple-100 text-sm sm:text-base font-medium drop-shadow-sm">
                {slide.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full backdrop-blur-sm transition"
            aria-label="Previous Slide"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full backdrop-blur-sm transition"
            aria-label="Next Slide"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === current ? 'w-8 bg-purple-400' : 'w-2.5 bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}