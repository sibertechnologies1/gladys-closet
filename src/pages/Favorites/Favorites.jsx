import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

const FAVORITES_KEY = "favorite_products";

export default function Favorites() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const getFavoriteIds = () => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      // This component expects favorite_products to contain product IDs.
      // Remove invalid values and duplicate IDs.
      return [...new Set(parsed.filter(Boolean))];
    } catch (error) {
      console.error("Invalid favorites data:", error);

      // Reset corrupted or invalid data
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));

      return [];
    }
  };

  const fetchFavoriteProducts = useCallback(async () => {
    setLoading(true);

    const favoriteIds = getFavoriteIds();

    if (favoriteIds.length === 0) {
      setFavoriteProducts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", favoriteIds);

    if (error) {
      console.error("Error fetching favorites:", error.message);
      setFavoriteProducts([]);
    } else {
      setFavoriteProducts(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavoriteProducts();

    const handleFavoritesUpdated = () => {
      fetchFavoriteProducts();
    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoritesUpdated
    );

    window.addEventListener(
      "storage",
      handleFavoritesUpdated
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoritesUpdated
      );

      window.removeEventListener(
        "storage",
        handleFavoritesUpdated
      );
    };
  }, [fetchFavoriteProducts]);

  const removeFavorite = (id) => {
    const currentFavoriteIds = getFavoriteIds();

    const updatedFavoriteIds = currentFavoriteIds.filter(
      (favoriteId) => String(favoriteId) !== String(id)
    );

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavoriteIds)
    );

    setFavoriteProducts((previousProducts) =>
      previousProducts.filter(
        (product) => String(product.id) !== String(id)
      )
    );

    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-6">
          Saved Favorites
        </h1>

        {loading ? (
          <p>Loading your saved items...</p>
        ) : favoriteProducts.length === 0 ? (
          <p className="text-gray-500">
            Your wishlist is currently empty.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="border p-4 rounded-2xl flex flex-col justify-between"
              >
                <img
                  src={
                    product.image_urls?.[0] ||
                    "https://via.placeholder.com/300"
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />

                <h2 className="font-bold text-gray-800">
                  {product.name}
                </h2>

                <p className="font-black text-purple-600 mt-1">
                  GHS{" "}
                  {(Number(product.price_pesewas || 0) / 100).toFixed(2)}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                  >
                    <FiShoppingBag />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50"
                    aria-label={`Remove ${product.name} from favorites`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}