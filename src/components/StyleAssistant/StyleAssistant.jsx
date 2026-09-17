import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import { FiShoppingBag, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

export default function StyleAssistant({ currentProduct }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { addToCart } = useCart();

  const handleOpenModal = async () => {
    setIsOpen(true);
    if (recommendations.length > 0) return; // Don't refetch if already loaded

    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Fetch related items directly from Supabase (Bypasses Edge Function issues)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("id", currentProduct.id)
        .neq("category", currentProduct.category) // Fetch complementary items from different categories
        .limit(3);

      if (error) throw error;

      // 2. Fallback if no specific cross-category matches exist
      if (!data || data.length === 0) {
        const { data: fallbackData } = await supabase
          .from("products")
          .select("*")
          .neq("id", currentProduct.id)
          .limit(3);
        setRecommendations(fallbackData || []);
      } else {
        setRecommendations(data);
      }
    } catch (err) {
      console.error("Styling fetch error:", err.message);
      setErrorMsg("Unable to load style suggestions right now.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (pesewas) => {
    return ((Number(pesewas) || 0) / 100).toFixed(2);
  };

  return (
    <>
      {/* Sleek inline trigger button on the card */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="mt-3 w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
      >
        <HiSparkles className="w-4 h-4 text-purple-600" />
        Complete the Look
      </button>

      {/* Styled Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <HiSparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Complete the Look</h3>
                  <p className="text-xs text-gray-400">Items that match with {currentProduct?.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6">
              {loading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : errorMsg ? (
                <p className="text-xs text-red-500 text-center py-4">{errorMsg}</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {recommendations.map((item) => {
                    const imgUrl = item.image_urls?.[0] || "https://via.placeholder.com/150";
                    return (
                      <div
                        key={item.id}
                        className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition"
                      >
                        <div>
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="w-full aspect-square object-cover rounded-xl mb-2"
                          />
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                          <p className="text-xs font-black text-purple-600 mt-0.5">
                            GH₵ {formatPrice(item.price_pesewas)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart({
                            ...item,
                            price: formatPrice(item.price_pesewas),
                            image: imgUrl,
                            quantity: 1
                          })}
                          className="mt-3 w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiShoppingBag className="w-3 h-3" /> Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}