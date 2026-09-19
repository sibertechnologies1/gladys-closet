import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";
import { pesewasToCedisInput } from "../../lib/format";
import { FiShoppingCart, FiHeart, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import StockBadge from '../../components/StockBadge';
import PreOrderModal from '../../components/PreOrderModal/PreOrderModal';
import SizeGuideModal from '../../components/SizeGuideModal/SizeGuideModal';
import StyleAssistant from '../../components/StyleAssistant/StyleAssistant';

export default function ProductGrid({ selectedCategory, limit = null, isNewArrivalsOnly = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [preorderProduct, setPreorderProduct] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  
  // State tracking active image index per product ID
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  // State tracking selected variant object per product ID
  const [selectedVariants, setSelectedVariants] = useState({});
  const [touchStart, setTouchStart] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorite_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (productId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updated = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavorites(updated);
    localStorage.setItem('favorite_products', JSON.stringify(updated));
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const [sortBy, setSortBy] = useState('newest'); 
  const [maxPrice, setMaxPrice] = useState(2000); 

  const searchQuery = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const activeCategory = selectedCategory || urlCategory;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase.from('products').select(`
          *,
          product_variants (*)
        `).eq('is_active', true);

        if (isNewArrivalsOnly) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          query = query.gte('created_at', thirtyDaysAgo.toISOString());
        }

        if (searchQuery.trim()) {
          const term = `%${searchQuery.trim()}%`;
          query = query.or(`name.ilike.${term},description.ilike.${term},category.ilike.${term},audience.ilike.${term}`);
        } else if (activeCategory && activeCategory !== 'all') {
          query = query.or(`audience.ilike.${activeCategory},category.ilike.${activeCategory}`);
        }

        if (sortBy === 'price_asc') query = query.order('price_pesewas', { ascending: true });
        else if (sortBy === 'price_desc') query = query.order('price_pesewas', { ascending: false });
        else query = query.order('created_at', { ascending: false });

        if (limit) query = query.limit(limit);

        const { data, error } = await query;
        if (error) throw error;

        setProducts(data || []);

        // Initialize selected variants with first variant per product
        if (data && data.length > 0) {
          const initialVariants = {};
          data.forEach((p) => {
            if (p.product_variants && p.product_variants.length > 0) {
              initialVariants[p.id] = p.product_variants[0];
            }
          });
          setSelectedVariants(initialVariants);
        }
      } catch (err) {
        console.error('Error fetching products:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory, searchQuery, sortBy, limit, isNewArrivalsOnly]);

  const formatPrice = (pesewas) => {
    if (typeof pesewasToCedisInput === 'function') {
      return Number(pesewasToCedisInput(pesewas));
    }
    return (Number(pesewas) || 0) / 100;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => formatPrice(item.price_pesewas) <= maxPrice);
  }, [products, maxPrice]);

  // Sync active variant when carousel slide changes
  const updateVariantFromImageIndex = (productId, newIdx, images, variants) => {
    const targetImage = images[newIdx];
    if (!targetImage || !variants || variants.length === 0) return;

    const matchedVariant = variants.find((v) => {
      const vImgs = [
        ...(Array.isArray(v.images) ? v.images : []),
        ...(Array.isArray(v.image_urls) ? v.image_urls : []),
        v.image_url,
        v.color_image_url
      ].filter(Boolean);
      return vImgs.includes(targetImage);
    });

    if (matchedVariant) {
      setSelectedVariants((prev) => ({
        ...prev,
        [productId]: matchedVariant
      }));
    }
  };

  const handleNextImage = (productId, imagesLength, images, variants, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextIdx = ((activeImageIndexes[productId] || 0) + 1) % imagesLength;
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: nextIdx,
    }));
    updateVariantFromImageIndex(productId, nextIdx, images, variants);
  };

  const handlePrevImage = (productId, imagesLength, images, variants, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prevIdx = ((activeImageIndexes[productId] || 0) - 1 + imagesLength) % imagesLength;
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: prevIdx,
    }));
    updateVariantFromImageIndex(productId, prevIdx, images, variants);
  };

  const handleSelectImage = (productId, index, images, variants, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: index,
    }));
    updateVariantFromImageIndex(productId, index, images, variants);
  };

  // Handle color badge click: updates selected variant and slides to its image
  const handleColorSelect = (productId, variant, images, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));

    const variantImg = variant.color_image_url || variant.image_url || (Array.isArray(variant.images) ? variant.images[0] : null);
    if (variantImg) {
      const imgIdx = images.findIndex((img) => img === variantImg);
      if (imgIdx !== -1) {
        setActiveImageIndexes((prev) => ({
          ...prev,
          [productId]: imgIdx,
        }));
      }
    }
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (productId, imagesLength, images, variants, e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 50) {
      handleNextImage(productId, imagesLength, images, variants);
    } else if (distance < -50) {
      handlePrevImage(productId, imagesLength, images, variants);
    }
    setTouchStart(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">
            {isNewArrivalsOnly ? 'Fresh Drops' : searchQuery ? 'Search Results' : 'Exclusive Collection'}
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy capitalize mt-1">
            {isNewArrivalsOnly ? 'New Arrivals' : searchQuery ? `Results for "${searchQuery}"` : activeCategory && activeCategory !== 'all' ? `${activeCategory} Collection` : 'Featured Apparel'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <FiFilter className="text-brand-purple" />
            <span>Max Price: <strong>GH₵ {maxPrice}</strong></span>
            <input 
              type="range" min="50" max="5000" step="50" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-brand-purple w-24 cursor-pointer"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-brand-purple"
          >
            <option value="newest">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(true)}
            className="text-xs font-bold text-brand-purple hover:text-brand-pink transition"
          >
            📏 Size Guide
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-brand-purple font-semibold">Loading catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl">
          <p className="text-lg font-medium">No products match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => {
            const displayPrice = formatPrice(product.price_pesewas);
            const isFavorite = favorites.includes(product.id);
            const isPreorder = Boolean(product.is_preorder);
            
            // Primary showcase images
            const mainImages = [
              ...(Array.isArray(product.images) ? product.images : []),
              ...(Array.isArray(product.image_urls) ? product.image_urls : []),
              ...(product.image_url ? [product.image_url] : [])
            ];

            // Variant images
            const variantImages = (product.product_variants || []).flatMap((v) => {
              const imgs = [];
              if (Array.isArray(v.images)) imgs.push(...v.images);
              if (Array.isArray(v.image_urls)) imgs.push(...v.image_urls);
              if (v.image_url) imgs.push(v.image_url);
              if (v.color_image_url) imgs.push(v.color_image_url);
              return imgs;
            });

            const combinedImages = Array.from(new Set([...mainImages, ...variantImages])).filter(Boolean);
            const images = combinedImages.length > 0 ? combinedImages : ['https://via.placeholder.com/400'];

            const activeIdx = activeImageIndexes[product.id] || 0;
            const currentImg = images[activeIdx] || images[0];

            const totalStock = product.product_variants?.length > 0
              ? product.product_variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0)
              : (product.stock ?? 0);

            const variants = product.product_variants || [];
            const selectedVar = selectedVariants[product.id] || variants[0] || null;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border border-purple-50 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  <div 
                    className="relative overflow-hidden group/carousel bg-gray-50"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={(e) => handleTouchEnd(product.id, images.length, images, variants, e)}
                  >
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={currentImg}
                        alt={product.name}
                        className="w-full h-80 object-cover hover:scale-105 transition duration-500"
                      />
                    </Link>

                    {images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <button
                          type="button"
                          onClick={(e) => handlePrevImage(product.id, images.length, images, variants, e)}
                          className="pointer-events-auto bg-white/80 backdrop-blur-md p-2 rounded-full shadow hover:bg-white text-gray-800 transition transform hover:scale-110"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleNextImage(product.id, images.length, images, variants, e)}
                          className="pointer-events-auto bg-white/80 backdrop-blur-md p-2 rounded-full shadow hover:bg-white text-gray-800 transition transform hover:scale-110"
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {images.length > 1 && (
                      <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-1.5 z-10">
                        {images.map((_, imgIndex) => (
                          <button
                            key={imgIndex}
                            type="button"
                            onClick={(e) => handleSelectImage(product.id, imgIndex, images, variants, e)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              activeIdx === imgIndex 
                                ? 'w-5 bg-brand-purple' 
                                : 'w-1.5 bg-white/70 hover:bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="absolute top-4 left-4 z-10">
                      {isPreorder ? (
                        <span className="bg-brand-purple text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          Pre-Order
                        </span>
                      ) : (
                        <StockBadge productId={product.id} initialStock={totalStock} />
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md p-2.5 rounded-full text-brand-navy hover:bg-white transition shadow-sm"
                    >
                      {isFavorite ? <FaHeart className="w-4 h-4 text-red-500" /> : <FiHeart className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">{product.category}</span>
                    <Link to={`/product/${product.id}`}>
                      <h2 className="text-lg font-bold text-brand-navy mt-1 hover:text-brand-purple transition">{product.name}</h2>
                    </Link>
                    
                    {/* Interactive Color Variant Badges */}
                    {variants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {variants.map((v) => {
                          const colorLabel = v.color_name || v.color;
                          if (!colorLabel) return null;
                          const isSelected = (selectedVar?.id && selectedVar?.id === v.id) || 
                            ((selectedVar?.color_name || selectedVar?.color) === colorLabel);

                          return (
                            <button
                              key={v.id || colorLabel}
                              type="button"
                              onClick={(e) => handleColorSelect(product.id, v, images, e)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition ${
                                isSelected
                                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                              }`}
                            >
                              {colorLabel}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                    <div>
                      <StyleAssistant currentProduct={product} />
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-purple-50 mt-4">
                  <span className="text-xl font-black text-brand-navy">
                    GH₵ {Number(displayPrice).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isPreorder) {
                        setPreorderProduct(product);
                      } else {
                        addToCart({ 
                          ...product, 
                          price: displayPrice,
                          image: currentImg,
                          selected_variant_id: selectedVar?.id || null,
                          selected_color: selectedVar?.color_name || selectedVar?.color || null,
                          selected_size: selectedVar?.size || null,
                          quantity: 1,
                          is_preorder: isPreorder
                        });
                      }
                    }}
                    disabled={totalStock <= 0 && !isPreorder}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md ${
                      isPreorder || totalStock > 0
                        ? 'bg-brand-purple text-white hover:bg-brand-pink'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    {isPreorder ? 'Pre-Order' : totalStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {preorderProduct && <PreOrderModal product={preorderProduct} onClose={() => setPreorderProduct(null)} />}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}