import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, listOrders } from "../../lib/orders";
import { formatGHS } from "../../lib/format";
import StatusBadge from "../../components/StatusBadge";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getDashboardStats(), listOrders()])
      .then(([statsData, orders]) => {
        setStats(statsData);
        setRecentOrders(orders.slice(0, 6));
      })
      .catch(() => setError("Couldn't load dashboard data. Check your Supabase connection."));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">A snapshot of how the store is doing.</p>

      {error && <p className="mt-6 text-sm text-coral-dark">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={stats ? stats.totalOrders : "—"} />
        <StatCard
          label="Total sales"
          value={stats ? formatGHS(stats.totalSalesPesewas) : "—"}
        />
        <StatCard label="Pending orders" value={stats ? stats.pendingCount : "—"} accent />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-coral hover:text-coral-dark">
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    No orders yet. They'll show up here once customers start checking out.
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{formatGHS(order.total_pesewas)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl font-medium ${accent ? "text-coral" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
