import { useCart } from "../../context/CartContext";
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';

export default function CartDrawer({ onProceedToCheckout }) {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPesewas } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiShoppingBag className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-bold text-gray-900">Your Shopping Bag</h2>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-black p-1"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Your cart is currently empty.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 border-b border-gray-100 pb-4">
                  <img
                    src={item.image_urls[0] || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-md"
                  />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Size: <span className="font-semibold text-gray-700">{item.selectedSize}</span></p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        GHS {((item.price_pesewas * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                        className="p-1 border rounded hover:bg-gray-100 text-gray-600"
                      >
                        <FiMinus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                        className="p-1 border rounded hover:bg-gray-100 text-gray-600"
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Subtotal</span>
                <span>GHS {(totalPesewas / 100).toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
              
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full bg-black text-white py-3 rounded-md font-bold text-sm hover:bg-gray-800 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}