import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getSiteContent } from "../../lib/content";

const LOCAL_STORAGE_KEY = "cached_home_hero_slides";

export default function HomeHeroSection() {
  const navigate = useNavigate();

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

  // Inject critical image link preloads into document head for fast mobile rendering
  useEffect(() => {
    if (slides.length > 0 && slides[0]?.image) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = slides[0].image;
      document.head.appendChild(link);

      return () => {
        try {
          document.head.removeChild(link);
        } catch (e) {
          // Ignore if already unmounted
        }
      };
    }
  }, [slides]);

  useEffect(() => {
    let isMounted = true;

    async function loadSlides() {
      try {
        const data = await getSiteContent();
        if (data?.home_hero_slides) {
          const parsed = JSON.parse(data.home_hero_slides);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

            // Force mobile image decode before state update
            await Promise.all(
              parsed.map((slide) => {
                return new Promise((resolve) => {
                  if (!slide.image) return resolve();
                  const img = new Image();
                  img.src = slide.image;
                  if ("decode" in img) {
                    img.decode().then(resolve).catch(resolve);
                  } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                  }
                });
              })
            );

            if (isMounted) {
              setSlides(parsed);
            }
          }
        }
      } catch (e) {
        console.error("Error loading home hero slides:", e);
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

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleCtaClick = (slide) => {
    // Navigates to a specific category link if defined in admin, or falls back to /shop
    const targetPath = slide.link || "/shop";
    navigate(targetPath);
  };

  if (loading && slides.length === 0) {
    return <div className="w-full h-[80vh] min-h-[550px]" />;
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[current] || slides[0];

  return (
    <section className="relative w-full h-[80vh] min-h-[550px] overflow-hidden">
      <img
        src={currentSlide.image}
        alt={currentSlide.title || "Home Banner Background"}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide.id || current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.title || "Home Banner"}
            fetchPriority={current === 0 ? "high" : "auto"}
            loading="eager"
            decoding="sync"
            className="w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

          <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-center text-white">
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="max-w-xl space-y-4"
            >
              {currentSlide.subtitle && (
                <span className="inline-block text-amber-300 text-xs font-bold uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-300/20">
                  {currentSlide.subtitle}
                </span>
              )}
              {currentSlide.title && (
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  {currentSlide.title}
                </h1>
              )}
              {currentSlide.description && (
                <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                  {currentSlide.description}
                </p>
              )}
              {currentSlide.cta && (
                <div className="pt-2">
                  <button
                    onClick={() => handleCtaClick(currentSlide)}
                    className="bg-amber-300 hover:bg-amber-400 text-gray-900 font-bold px-7 py-3 rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-lg active:scale-95"
                  >
                    {currentSlide.cta}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition z-10"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition z-10"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {slides.length > 1 && (
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
      )}
    </section>
  );
}