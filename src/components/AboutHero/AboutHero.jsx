import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import Abhero1 from '../AboutHero/Images/Abhero1.jpeg';
import Abhero2 from '../AboutHero/Images/Abhero2.jpeg';
import Abhero3 from '../AboutHero/Images/Abhero3.jpeg';
import Abhero4 from '../AboutHero/Images/Abhero4.jpeg';
import Abhero5 from '../AboutHero/Images/Abhero5.jpeg';
import Abhero6 from '../AboutHero/Images/Abhero6.jpeg';

const slides = [
  {
    image: Abhero1,
    title: "About Gladys' Closet",
    subtitle: "Your premier fashion destination in Accra, delivering curated style, confidence, and quality directly to your doorstep.",
  },
  {
    image: Abhero2,
    title: "Welcome To Our Boutique",
    subtitle: "Step inside and explore handpicked outfits crafted to elevate your daily style.",
  },
  {
    image: Abhero3,
    title: "Elegance Redefined",
    subtitle: "Discover tailored designs and timeless fashion pieces built for every occasion.",
  },
  {
    image: Abhero4,
    title: "Fashion For Everyone",
    subtitle: "Bringing you modern trends and vibrant styles for both men and women.",
  },
  {
    image: Abhero5,
    title: "Curated Accessories",
    subtitle: "Complete your look with our exclusive collection of jewelry and handbags.",
  },
  {
    image: Abhero6,
    title: "Shop With Confidence",
    subtitle: "Join thousands of satisfied shoppers across Accra and beyond.",
  },
];

export default function AboutHero() {
  const [current, setCurrent] = useState(0);

  // Auto-play interval (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

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
            alt={slide.title}
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