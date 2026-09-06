import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import hero1 from "./Images/hero1.jpg";
import hero2 from "./Images/hero2.jpg";
import hero3 from "./Images/hero3.jpg";
import hero4 from "./Images/hero4.jpg";
import hero5 from "./Images/hero5.jpg";
import hero6 from "./Images/hero6.jpg";
import hero7 from "./Images/hero7.jpg";

const slides = [
  {
    id: 1,
    image: hero1,
    subtitle: "New Arrival",
    title: "Urban Chic & Street Style",
    description: "Express your individuality with our vibrant statement dresses and accessories.",
    cta: "Shop The Look",
  },
  {
    id: 2,
    image: hero2,
    subtitle: "Fine Jewelry",
    title: "Layered Elegance",
    description: "Discover handcrafted gold-tone pendants and layered chains for every occasion.",
    cta: "Explore Jewelry",
  },
  {
    id: 3,
    image: hero3,
    subtitle: "Autumn Collection",
    title: "Classic Overcoats & Tailoring",
    description: "Refined outerwear designed to keep you warm with timeless sophistication.",
    cta: "Shop Outerwear",
  },
  {
    id: 4,
    image: hero4,
    subtitle: "Pop of Color",
    title: "Bold Knitwear & Accessories",
    description: "Brighten your wardrobe with rich textures and striking color combinations.",
    cta: "Shop Knits",
  },
  {
    id: 5,
    image: hero5,
    subtitle: "Luxury Details",
    title: "Minimalist Pendant Sets",
    description: "Subtle gold craftsmanship tailored to complement high-fashion aesthetics.",
    cta: "View Collection",
  },
  {
    id: 6,
    image: hero6,
    subtitle: "Signature Accessories",
    title: "Modern Chain Collections",
    description: "Sleek geometric lines combined with premium materials for daily luxury.",
    cta: "Shop Accessories",
  },
  {
    id: 7,
    image: hero7,
    subtitle: "Contemporary Wear",
    title: "Tailored Tones & Layering",
    description: "Clean silhouettes and versatile cuts engineered for supreme comfort.",
    cta: "Shop Apparel",
  },
];

export default function HomeHeroSection() {
  const [current, setCurrent] = useState(0);

  // Preload all slide images into browser cache immediately
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Autoplay timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative w-full h-[80vh] min-h-[550px] bg-gray-900 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover object-center"
          />

          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

          {/* Slide Content */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-center text-white">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-xl space-y-4"
            >
              <span className="inline-block text-amber-300 text-xs font-bold uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-300/20">
                {slides[current].subtitle}
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {slides[current].title}
              </h1>
              <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                {slides[current].description}
              </p>
              <div className="pt-2">
                <button className="bg-amber-300 hover:bg-amber-400 text-gray-900 font-bold px-7 py-3 rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-lg">
                  {slides[current].cta}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls: Prev / Next Buttons */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              current === idx
                ? "w-8 bg-amber-300"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}