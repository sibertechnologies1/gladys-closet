import { Link } from "react-router-dom";
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useCart } from "../../context/CartContext";

export default function Cart({ onProceedToCheckout }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  // Helper to resolve different image property structures safely
  const getProductImage = (item) => {
    if (!item) return "https://via.placeholder.com/150";
    if (typeof item.image === "string" && item.image.trim() !== "") return item.image;
    if (typeof item.image_url === "string" && item.image_url.trim() !== "") return item.image_url;
    if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
    if (Array.isArray(item.image) && item.image.length > 0) return item.image[0];
    return "https://via.placeholder.com/150";
  };

  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.price ? Number(item.price) : (item.price_pesewas || 0) / 100;
    return total + itemPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal > 0 ? 30 : 0;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-gray-500 text-sm mt-1">
              {cart.length === 1 ? "1 item in your bag" : `${cart.length} items in your bag`}
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            <FiArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const itemPrice = item.price ? Number(item.price) : (item.price_pesewas || 0) / 100;
                
                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={getProductImage(item)}
                        alt={item.name || "Product Image"}
                        className="w-20 h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                          {item.category || "Apparel"}
                        </span>
                        <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                        <p className="text-sm font-black text-gray-900 mt-1">
                          GHS {itemPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-bold text-gray-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:bg-gray-200 transition"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-base font-black text-gray-900 w-24 text-right">
                        GHS {(itemPrice * item.quantity).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        title="Remove Item"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                >
                  Clear Shopping Cart
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">GHS {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-gray-900">GHS {shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
                    <span>Total</span>
                    <span className="text-purple-600">GHS {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="w-full mt-6 bg-purple-600 text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-700 transition shadow-md"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}