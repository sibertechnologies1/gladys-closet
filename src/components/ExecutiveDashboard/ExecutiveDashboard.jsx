import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiAlertTriangle } from 'react-icons/fi';

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);

      // 1. Fetch Orders for Revenue Calculations
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount');

      // 2. Fetch Low Stock Products (Stock <= 5)
      const { data: lowStockItems, error: stockError } = await supabase
        .from('products')
        .select('id')
        .lte('stock', 5);

      if (!ordersError && !stockError) {
        const revenue = orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;
        const count = orders?.length || 0;
        const aov = count > 0 ? revenue / count : 0;

        setMetrics({
          totalRevenue: revenue,
          totalOrders: count,
          averageOrderValue: aov,
          lowStockCount: lowStockItems?.length || 0,
        });
      }

      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-6 text-brand-purple font-semibold">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
      <div>
        <h2 className="text-2xl font-black text-brand-navy">Executive Overview</h2>
        <p className="text-xs text-gray-500 mt-1">Real-time revenue metrics and store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-purple-50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Total Revenue</span>
            <p className="text-2xl font-black text-brand-navy mt-1">
              GH₵ {metrics.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-brand-purple">
            <FiDollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-purple-50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Total Orders</span>
            <p className="text-2xl font-black text-brand-navy mt-1">{metrics.totalOrders}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <FiShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white p-5 rounded-xl border border-purple-50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Avg Order Value</span>
            <p className="text-2xl font-black text-brand-navy mt-1">
              GH₵ {metrics.averageOrderValue.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <FiTrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-xl border border-purple-50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Low Stock Items</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{metrics.lowStockCount}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}