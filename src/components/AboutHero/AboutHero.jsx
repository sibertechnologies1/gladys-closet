import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getSiteContent } from '../../lib/content';

import img1 from './Images/Abhero1.jpeg';
import img2 from './Images/Abhero2.jpeg';
import img3 from './Images/Abhero3.jpeg';
import img4 from './Images/Abhero4.jpeg';
import img5 from './Images/Abhero5.jpeg';
import img6 from './Images/Abhero6.jpeg';

const defaultSlides = [
  {
    image: img1,
    title: "About Gladys' Closet",
    subtitle: "Your premier fashion destination in Accra, delivering curated style, confidence, and quality directly to your doorstep.",
  },
  {
    image: img2,
    title: "Welcome To Our Boutique",
    subtitle: "Step inside and explore handpicked outfits crafted to elevate your daily style.",
  },
  {
    image: img3,
    title: "Elegance Redefined",
    subtitle: "Discover tailored designs and timeless fashion pieces built for every occasion.",
  },
  {
    image: img4,
    title: "Fashion For Everyone",
    subtitle: "Bringing you modern trends and vibrant styles for both men and women.",
  },
  {
    image: img5,
    title: "Curated Accessories",
    subtitle: "Complete your look with our exclusive collection of jewelry and handbags.",
  },
  {
    image: img6,
    title: "Shop With Confidence",
    subtitle: "Join thousands of satisfied shoppers across Accra and beyond.",
  },
];

export default function AboutHero() {
  const [slides, setSlides] = useState(defaultSlides);
  const [current, setCurrent] = useState(0);

  // Fetch dynamic slides from Supabase
  useEffect(() => {
    getSiteContent().then((data) => {
      if (data.about_hero_slides) {
        try {
          const parsed = JSON.parse(data.about_hero_slides);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
          }
        } catch (e) {
          console.error('Error parsing about_hero_slides JSON:', e);
        }
      }
    });
  }, []);

  // Auto-play interval (5 seconds)
  useEffect(() => {
    if (slides.length === 0) return;
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

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title || 'About Banner'}
            className="w-full h-full object-cover object-center"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-900/60 to-black/40" />

          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
              {slide.title}
            </h1>
            <p className="max-w-2xl text-purple-100 text-sm sm:text-base font-medium drop-shadow-sm">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
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

      {/* Carousel Dots */}
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
    </div>
  );
}