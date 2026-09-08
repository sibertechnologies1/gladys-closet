import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar/Navbar';
import Footer from "../../components/Footer/Footer";
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from "../../context/CartContext";

export default function Favorites() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFavoriteProducts();
  }, []);

  const fetchFavoriteProducts = async () => {
    setLoading(true);
    const saved = localStorage.getItem('favorite_products');
    const favoriteIds = saved ? JSON.parse(saved) : [];

    if (favoriteIds.length === 0) {
      setFavoriteProducts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', favoriteIds);

    if (error) {
      console.error('Error fetching favorites:', error.message);
    } else {
      setFavoriteProducts(data || []);
    }
    setLoading(false);
  };

  const removeFavorite = (id) => {
    const saved = localStorage.getItem('favorite_products');
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.filter((item) => item !== id);
    
    localStorage.setItem('favorite_products', JSON.stringify(updated));
    setFavoriteProducts((prev) => prev.filter((product) => product.id !== id));
    
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Saved Favorites</h1>

        {loading ? (
          <p>Loading your saved items...</p>
        ) : favoriteProducts.length === 0 ? (
          <p className="text-gray-500">Your wishlist is currently empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="border p-4 rounded-2xl flex flex-col justify-between">
                <img 
                  src={product.image_urls?.[0] || 'https://via.placeholder.com/300'} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h2 className="font-bold text-gray-800">{product.name}</h2>
                <p className="font-black text-purple-600 mt-1">
                  GHS {(product.price_pesewas / 100).toFixed(2)}
                </p>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                  >
                    <FiShoppingBag /> Add to Cart
                  </button>
                  <button 
                    onClick={() => removeFavorite(product.id)}
                    className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}