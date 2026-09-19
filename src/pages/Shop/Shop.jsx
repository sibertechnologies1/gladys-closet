import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from "../../components/Footer/Footer";
import PreOrderModal from "../../components/PreOrderModal/PreOrderModal";
import SizeGuideModal from "../../components/SizeGuideModal/SizeGuideModal";
import StyleAssistant from "../../components/StyleAssistant/StyleAssistant";
import StockBadge from '../../components/StockBadge';
import { FiFilter, FiSearch, FiShoppingBag, FiCheck, FiX, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import { pesewasToCedisInput } from "../../lib/format";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [preorderProduct, setPreorderProduct] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
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

  const selectedAudience = searchParams.get('audience') || searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [selectedAudience, searchQuery, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select(`
        *,
        product_variants (*)
      `).eq('is_active', true);

      if (selectedAudience !== 'all') {
        query = query.or(`audience.ilike.${selectedAudience.toLowerCase()},category.ilike.${selectedAudience.toLowerCase()}`);
      }

      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term}`);
      }

      if (sortBy === 'low-to-high') query = query.order('price_pesewas', { ascending: true });
      else if (sortBy === 'high-to-low') query = query.order('price_pesewas', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      const loadedProducts = data || [];
      setProducts(loadedProducts);

      if (loadedProducts.length > 0) {
        const highestPrice = Math.max(
          ...loadedProducts.map((p) => formatPrice(p.price_pesewas))
        );
        setMaxPrice(Math.ceil(highestPrice) || 5000);

        const initialVariants = {};
        loadedProducts.forEach((p) => {
          if (p.product_variants && p.product_variants.length > 0) {
            initialVariants[p.id] = p.product_variants[0];
          }
        });
        setSelectedVariants(initialVariants);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (pesewas) => {
    if (typeof pesewasToCedisInput === 'function') {
      return Number(pesewasToCedisInput(pesewas));
    }
    return (Number(pesewas) || 0) / 100;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => formatPrice(item.price_pesewas) <= maxPrice);
  }, [products, maxPrice]);

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

  const handleAddToCart = (product, currentImg, selectedVar, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const displayPrice = formatPrice(product.price_pesewas);

    addToCart({
      ...product,
      price: displayPrice,
      image: currentImg,
      selected_variant_id: selectedVar?.id || null,
      selected_color: selectedVar?.color_name || selectedVar?.color || null,
      selected_size: selectedVar?.size || null,
      quantity: 1,
      is_preorder: Boolean(product.is_preorder)
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Our Collection</h1>
            <p className="text-gray-500 text-sm mt-1">Explore curated fashion pieces</p>
          </div>

          {searchQuery && (
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold">
              <span>Results for: "{searchQuery}"</span>
              <button onClick={() => setSearchParams({})} className="p-1 hover:bg-purple-100 rounded-lg">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 h-fit">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <FiFilter className="text-purple-600" />
              <h2 className="font-bold text-gray-800 text-base">Filters</h2>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-2">
                {['all', 'women', 'men', 'kids', 'sports', 'accessories'].map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setSearchParams(aud === 'all' ? {} : { audience: aud })}
                    className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-semibold capitalize ${
                      selectedAudience.toLowerCase() === aud ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {aud === 'all' ? 'All Products' : aud}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Max Price</h3>
                <span className="text-sm font-bold text-purple-600">GH₵ {maxPrice}</span>
              </div>
              <input
                type="range"
                min="10"
                max="5000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> items</p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
                <button type="button" onClick={() => setIsSizeGuideOpen(true)} className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
                  📏 Find Your Size
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => <div key={n} className="bg-gray-100 h-80 rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FiSearch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-bold">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const displayPrice = formatPrice(product.price_pesewas);
                  
                  const variantImages = (product.product_variants || []).flatMap((v) => {
                    const imgs = [];
                    if (Array.isArray(v.images)) imgs.push(...v.images);
                    if (Array.isArray(v.image_urls)) imgs.push(...v.image_urls);
                    if (v.image_url) imgs.push(v.image_url);
                    if (v.color_image_url) imgs.push(v.color_image_url);
                    return imgs;
                  });

                  const rawImages = [
                    ...(product.image_urls || []),
                    ...(product.image_url ? [product.image_url] : []),
                    ...variantImages
                  ];

                  const images = Array.from(new Set(rawImages)).length > 0
                    ? Array.from(new Set(rawImages)).filter(Boolean)
                    : ['https://via.placeholder.com/400'];

                  const activeIdx = activeImageIndexes[product.id] || 0;
                  const currentImg = images[activeIdx] || images[0];

                  const stockTotal = product.product_variants?.length > 0
                    ? product.product_variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0)
                    : (product.stock ?? 0);

                  const inStock = stockTotal > 0;
                  const isPreorder = Boolean(product.is_preorder);
                  const isFavorite = favorites.includes(product.id);

                  const variants = product.product_variants || [];
                  const selectedVar = selectedVariants[product.id] || variants[0] || null;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col justify-between relative"
                    >
                      <div>
                        {/* Interactive Image Carousel */}
                        <div 
                          className="relative aspect-square overflow-hidden bg-gray-100 group/carousel"
                          onTouchStart={handleTouchStart}
                          onTouchEnd={(e) => handleTouchEnd(product.id, images.length, images, variants, e)}
                        >
                          <Link to={`/product/${product.id}`} className="block w-full h-full">
                            <img src={currentImg} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          </Link>
                          
                          {/* Chevron Controls */}
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

                          {/* Dots Indicator */}
                          {images.length > 1 && (
                            <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-1.5 z-10">
                              {images.map((_, imgIndex) => (
                                <button
                                  key={imgIndex}
                                  type="button"
                                  onClick={(e) => handleSelectImage(product.id, imgIndex, images, variants, e)}
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    activeIdx === imgIndex 
                                      ? 'w-5 bg-purple-600' 
                                      : 'w-1.5 bg-white/70 hover:bg-white'
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Stock / Preorder Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            {isPreorder ? (
                              <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                                Pre-Order
                              </span>
                            ) : (
                              <StockBadge productId={product.id} initialStock={stockTotal} />
                            )}
                          </div>

                          {/* Favorites Toggle */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-md text-gray-800 hover:bg-white transition"
                          >
                            {isFavorite ? <FaHeart className="w-4 h-4 text-red-500" /> : <FiHeart className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="p-5">
                          <span className="text-[10px] font-bold text-purple-600 uppercase">{product.category}</span>
                          <Link to={`/product/${product.id}`} className="block">
                            <h3 className="font-bold text-gray-800 text-base mt-1 line-clamp-1 hover:text-purple-600 transition">{product.name}</h3>
                          </Link>
                          
                          {/* Color Variant Pills */}
                          {variants.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
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
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                                    }`}
                                  >
                                    {colorLabel}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{product.description}</p>
                          <div>
                            <StyleAssistant currentProduct={product} />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-400 block">Price</span>
                            <span className="text-lg font-black text-gray-900">GH₵ {Number(displayPrice).toFixed(2)}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isPreorder) setPreorderProduct(product);
                              else handleAddToCart(product, currentImg, selectedVar, e);
                            }}
                            disabled={!inStock && !isPreorder}
                            className={`p-3 rounded-xl font-bold transition flex items-center justify-center ${
                              inStock || isPreorder
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {addedId === product.id ? <FiCheck className="w-4 h-4" /> : <FiShoppingBag className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {preorderProduct && <PreOrderModal product={preorderProduct} onClose={() => setPreorderProduct(null)} />}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      <Footer />
    </div>
  );
}