import { useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const categories = [
  {
    id: 1,
    name: "Women's Collection",
    slug: "women",
    itemCount: "120+ Items",
    image: new URL("./Images/women.jpg", import.meta.url).href,
  },
  {
    id: 2,
    name: "Fine Jewelry",
    slug: "jewelry",
    itemCount: "45 Items",
    image: new URL("./Images/jewelry.jpg", import.meta.url).href,
  },
  {
    id: 3,
    name: "Outerwear & Tailoring",
    slug: "outerwear",
    itemCount: "80+ Items",
    image: new URL("./Images/outerwear.jpg", import.meta.url).href,
  },
  {
    id: 4,
    name: "Signature Accessories",
    slug: "accessories",
    itemCount: "60+ Items",
    image: new URL("./Images/accessories.jpg", import.meta.url).href,
  },
];

export default function FeaturedCategories({ onSelectCategory }) {
  useEffect(() => {
    categories.forEach((cat) => {
      const img = new Image();
      img.src = cat.image;
    });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-6 sm:mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
            Curated Styles
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mt-1">
            Shop by Category
          </h2>
        </div>
      </div>

      {/* Responsive Grid: 1 col on Mobile, 2 on Tablet, 4 on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
            className="group relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Category Image */}
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 ease-out"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Item Count Badge */}
            <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {cat.itemCount}
            </span>

            {/* Content Positioned at Bottom */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold">
                {cat.name}
              </h3>
              <div className="flex items-center text-xs font-semibold text-amber-300 group-hover:translate-x-1 transition duration-300">
                <span>Explore Collection</span>
                <FiArrowRight className="ml-1.5 w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}