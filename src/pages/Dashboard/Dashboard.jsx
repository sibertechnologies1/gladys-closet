import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiUser, FiPackage, FiHeart, FiLogOut, FiShoppingBag } from 'react-icons/fi';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);

      // Fetch user's orders from Supabase
      const { data: userOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && userOrders) {
        setOrders(userOrders);
      }

      // Fetch favorite items from localStorage & database
      const savedFavIds = JSON.parse(localStorage.getItem('favorite_products') || '[]');
      if (savedFavIds.length > 0) {
        const { data: favProducts } = await supabase
          .from('products')
          .select('*')
          .in('id', savedFavIds);
        
        if (favProducts) setFavorites(favProducts);
      }

      setLoading(false);
    }

    getUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="text-center py-20 text-brand-purple font-semibold">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Banner */}
      <div className="bg-brand-navy text-white rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-pink font-bold">Account Overview</span>
          <h1 className="text-3xl font-black mt-1">
            Hello, {user?.user_metadata?.full_name || user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-300 text-sm mt-1">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <FiLogOut /> Log Out
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2 h-fit">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-semibold text-sm transition ${
              activeTab === 'orders' ? 'bg-brand-purple text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiPackage /> My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-semibold text-sm transition ${
              activeTab === 'favorites' ? 'bg-brand-purple text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiHeart /> Wishlist ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-semibold text-sm transition ${
              activeTab === 'profile' ? 'bg-brand-purple text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiUser /> Profile Details
          </button>
        </div>

        {/* Dynamic Content Pane */}
        <div className="md:col-span-3">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-4">Order History</h2>
              {orders.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
                  <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-gray-400">ORDER #{order.id.slice(0, 8)}</span>
                        <h3 className="text-lg font-bold text-brand-navy mt-1">GHS {(order.total_pesewas / 100).toFixed(2)}</h3>
                        <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status || 'Processing'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-4">Saved Products</h2>
              {favorites.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
                  <FiHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Your wishlist is currently empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((prod) => (
                    <div key={prod.id} className="border border-gray-100 p-4 rounded-2xl flex gap-4 items-center bg-white">
                      <img src={prod.image_urls?.[0]} alt={prod.name} className="w-20 h-20 object-cover rounded-xl" />
                      <div>
                        <h3 className="font-bold text-brand-navy text-sm">{prod.name}</h3>
                        <p className="text-brand-purple font-bold text-sm mt-1">GHS {(prod.price_pesewas / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-brand-navy">Personal Details</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Name:</strong> {user?.user_metadata?.full_name || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Account Created:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}