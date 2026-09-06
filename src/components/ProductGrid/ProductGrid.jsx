import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";
import { FiShoppingCart, FiHeart } from 'react-icons/fi';

export default function ProductGrid({ selectedCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from('products').select('*').eq('is_active', true);

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.or(`audience.eq.${selectedCategory},category.eq.${selectedCategory}`);
      }

      const { data, error } = await query;
      if (error) console.error(error);
      else setProducts(data || []);
      setLoading(false);
    }

    fetchProducts();
  }, [selectedCategory]);

  if (loading) {
    return <div className="text-center py-20 text-brand-purple font-semibold">Loading catalog...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">Exclusive Collection</span>
          <h1 className="text-3xl font-extrabold text-brand-navy capitalize mt-1">
            {selectedCategory === 'all' ? 'Featured Apparel' : `${selectedCategory} Collection`}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group bg-white rounded-2xl overflow-hidden border border-purple-50 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
          >
            <div className="relative overflow-hidden">
              <img
                src={product.image_urls[0] || 'https://via.placeholder.com/400'}
                alt={product.name}
                className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
              />
              <button 
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2.5 rounded-full text-brand-navy hover:text-brand-pink hover:bg-white transition shadow-sm"
                aria-label="Wishlist"
              >
                <FiHeart className="w-4 h-4" />
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
        ))}
      </div>
    </div>
  );
}