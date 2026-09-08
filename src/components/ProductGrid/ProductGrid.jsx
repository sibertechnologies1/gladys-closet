import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";
import { FiShoppingCart, FiHeart, FiFilter } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

// Deterministic random generator based on a seed number
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Shuffles an array consistently using the user's unique ID
function shuffleArrayForUser(array, userId) {
  if (!userId) return array;
  
  // Turn string user ID into a numeric seed
  let seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed++) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ProductGrid({ selectedCategory, limit = null, isNewArrivalsOnly = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [currentUser, setCurrentUser] = useState(null);

  // Favorites State (persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Get active session user for personalized grid order
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Toggle Favorite and Dispatch Event to Navbar
  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    
    const saved = localStorage.getItem('favorite_products');
    const currentFavorites = saved ? JSON.parse(saved) : [];

    const updatedFavorites = currentFavorites.includes(productId)
      ? currentFavorites.filter((id) => id !== productId)
      : [...currentFavorites, productId];

    setFavorites(updatedFavorites);
    localStorage.setItem('favorite_products', JSON.stringify(updatedFavorites));

    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  // Sorting & Filtering States
  const [sortBy, setSortBy] = useState('newest'); 
  const [maxPrice, setMaxPrice] = useState(2000); 

  // Search and Category parameters
  const searchQuery = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const activeCategory = selectedCategory || urlCategory;

  useEffect(() => {
    localStorage.setItem('favorite_products', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from('products').select('*').eq('is_active', true);

      if (isNewArrivalsOnly) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      }

      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term},category.ilike.${term},audience.ilike.${term}`);
      } 
      else if (activeCategory && activeCategory !== 'all') {
        query = query.or(`audience.eq.${activeCategory},category.eq.${activeCategory}`);
      }

      query = query.lte('price_pesewas', maxPrice * 100);

      if (sortBy === 'price_asc') {
        query = query.order('price_pesewas', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('price_pesewas', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        let fetchedData = data || [];
        
        // If sorting by default and user is logged in, randomize per-user
        if (sortBy === 'newest' && currentUser?.id) {
          fetchedData = shuffleArrayForUser(fetchedData, currentUser.id);
        }

        setProducts(fetchedData);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [activeCategory, searchQuery, sortBy, maxPrice, limit, isNewArrivalsOnly, currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">
            {isNewArrivalsOnly ? 'Fresh Drops' : searchQuery ? 'Search Results' : 'Exclusive Collection'}
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy capitalize mt-1">
            {isNewArrivalsOnly
              ? 'New Arrivals'
              : searchQuery 
                ? `Results for "${searchQuery}"`
                : activeCategory && activeCategory !== 'all' 
                  ? `${activeCategory} Collection`
                  : 'Featured Apparel'}
          </h1>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <FiFilter className="text-brand-purple" />
            <span>Max Price: <strong>GHS {maxPrice}</strong></span>
            <input 
              type="range" 
              min="50" 
              max="2000" 
              step="50" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-brand-purple w-24 cursor-pointer"
            />
          </div>

          <div className="h-4 w-px bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <label htmlFor="sort">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-brand-purple"
            >
              <option value="newest">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="text-center py-20 text-brand-purple font-semibold">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl">
          <p className="text-lg font-medium">No products match your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const isFavorite = favorites.includes(product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white rounded-2xl overflow-hidden border border-purple-50 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image_urls?.[0] || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
                  />
                  <button 
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2.5 rounded-full text-brand-navy hover:bg-white transition shadow-sm"
                    aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {isFavorite ? (
                      <FaHeart className="w-4 h-4 text-red-500" />
                    ) : (
                      <FiHeart className="w-4 h-4 hover:text-brand-pink" />
                    )}
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">{product.category}</span>
                    <h2 className="text-lg font-bold text-brand-navy mt-1 group-hover:text-brand-purple transition">{product.name}</h2>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-purple-50">
                    <span className="text-xl font-black text-brand-navy">
                      GHS {(product.price_pesewas / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-brand-purple text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-brand-pink transition duration-300 shadow-md"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}