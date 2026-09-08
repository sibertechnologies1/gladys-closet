import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from "../../components/Footer/Footer";
import { FiFilter, FiSearch, FiShoppingBag, FiCheck, FiX, FiHeart } from 'react-icons/fi';
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

  // Favorites State
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle Favorite, Persist to LocalStorage, and Notify Navbar
  const toggleFavorite = (productId, e) => {
    if (e) e.stopPropagation();
    
    const saved = localStorage.getItem('favorite_products');
    const currentFavorites = saved ? JSON.parse(saved) : [];

    const updatedFavorites = currentFavorites.includes(productId)
      ? currentFavorites.filter((id) => id !== productId)
      : [...currentFavorites, productId];

    setFavorites(updatedFavorites);
    localStorage.setItem('favorite_products', JSON.stringify(updatedFavorites));

    // Notify Navbar to update badge count immediately
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  // Active Filter States
  const selectedAudience = searchParams.get('audience') || searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [selectedAudience, searchQuery, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');

      if (selectedAudience !== 'all') {
        query = query.or(`audience.ilike.${selectedAudience.toLowerCase()},category.ilike.${selectedAudience.toLowerCase()}`);
      }

      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term}`);
      }

      if (sortBy === 'low-to-high') {
        query = query.order('price_pesewas', { ascending: true });
      } else if (sortBy === 'high-to-low') {
        query = query.order('price_pesewas', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
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

  const filteredProducts = products.filter((item) => {
    const itemPriceCedis = formatPrice(item.price_pesewas);
    return itemPriceCedis <= maxPrice;
  });

  const handleAudienceChange = (audience) => {
    const newParams = new URLSearchParams(searchParams);
    if (audience === 'all') {
      newParams.delete('audience');
      newParams.delete('category');
    } else {
      newParams.set('audience', audience);
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();

    const displayPrice = formatPrice(product.price_pesewas);
    const mainImage = (product.image_urls && product.image_urls.length > 0) 
      ? product.image_urls[0] 
      : 'https://via.placeholder.com/400x400?text=No+Image';

    addToCart({
      ...product,
      id: product.id,
      name: product.name,
      price: displayPrice,
      price_pesewas: product.price_pesewas,
      image: mainImage,
      image_url: mainImage,
      quantity: 1,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Shop Our Collection
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Explore curated fashion pieces from Gladys' Closet
            </p>
          </div>

          {searchQuery && (
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold self-center md:self-auto">
              <span>Results for: "{searchQuery}"</span>
              <button 
                onClick={clearSearch} 
                className="p-1 hover:bg-purple-100 rounded-lg text-purple-600 transition"
                title="Clear Search"
              >
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
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Category / Audience
              </h3>
              <div className="space-y-2">
                {['all', 'women', 'men', 'kids', 'sports', 'accessories'].map((aud) => (
                  <button
                    key={aud}
                    onClick={() => handleAudienceChange(aud)}
                    className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                      selectedAudience.toLowerCase() === aud
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {aud === 'all' ? 'All Products' : aud}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Max Price
                </h3>
                <span className="text-sm font-bold text-purple-600">
                  GHS {maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> items
              </p>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Sort By:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:border-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-gray-100 animate-pulse h-80 rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FiSearch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-bold">No products found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const displayPrice = formatPrice(product.price_pesewas);
                  const imageUrl = (product.image_urls && product.image_urls.length > 0)
                    ? product.image_urls[0]
                    : 'https://via.placeholder.com/400x400?text=No+Image';
                  const inStock = product.stock > 0;
                  const isFavorite = favorites.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col justify-between"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        {product.is_new && (
                          <span className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                            New
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(product.id, e)}
                          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-gray-700 hover:text-red-500 shadow-md transition"
                        >
                          {isFavorite ? (
                            <FaHeart className="w-4 h-4 text-red-500" />
                          ) : (
                            <FiHeart className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                            {product.category}
                          </span>
                          <h3 className="font-bold text-gray-800 text-base mt-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-400 block">Price</span>
                            <span className="text-lg font-black text-gray-900">
                              GHS {Number(displayPrice).toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={!inStock}
                            className={`p-3 rounded-xl font-bold transition flex items-center gap-1.5 ${
                              !inStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : addedId === product.id
                                ? 'bg-green-600 text-white'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                            }`}
                          >
                            {addedId === product.id ? (
                              <>
                                <FiCheck className="w-4 h-4" /> Added
                              </>
                            ) : !inStock ? (
                              "Out of Stock"
                            ) : (
                              <>
                                <FiShoppingBag className="w-4 h-4" /> Add
                              </>
                            )}
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

      <Footer />
    </div>
  );
}