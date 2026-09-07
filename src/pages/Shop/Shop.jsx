import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from "../../components/Footer/Footer";
import { FiFilter, FiSearch, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  // Active Filter States
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedType = searchParams.get('type') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('newest');

  // Fetch items dynamically from Supabase
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedType, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');

      // Apply Category Filters
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory.toLowerCase());
      }
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType.toLowerCase());
      }

      // Apply Sorting
      if (sortBy === 'low-to-high') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'high-to-low') {
        query = query.order('price', { ascending: false });
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

  // Client-side filtering for Search and Price Range
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('category');
      newParams.delete('type');
    } else {
      newParams.set('category', cat);
      newParams.delete('type');
    }
    setSearchParams(newParams);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Full-width Navbar */}
      <Navbar />

      {/* Centered Main Page Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Shop Our Collection
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Explore curated fashion pieces from Gladys' Closet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 h-fit">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <FiFilter className="text-purple-600" />
              <h2 className="font-bold text-gray-800 text-base">Filters</h2>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Category
              </h3>
              <div className="space-y-2">
                {['all', 'women', 'men', 'kids', 'sports', 'brands'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat === 'all' ? 'All Products' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
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
                min="50"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </aside>

          {/* Main Product Grid Container */}
          <main className="lg:col-span-3">
            {/* Top Control Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> items
              </p>

              {/* Sort Dropdown */}
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

            {/* Loading Skeleton */}
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
              /* Product Display Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={
                          product.image_url ||
                          'https://via.placeholder.com/400x400?text=No+Image'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {product.is_new && (
                        <span className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                          New
                        </span>
                      )}
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
                            GHS {Number(product.price).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.in_stock}
                          className={`p-3 rounded-xl font-bold transition flex items-center gap-1.5 ${
                            !product.in_stock
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
                          ) : (
                            <>
                              <FiShoppingBag className="w-4 h-4" /> Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Full-width Footer */}
      <Footer />
    </div>
  );
}