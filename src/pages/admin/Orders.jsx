import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOrders } from "../../lib/orders";
import { formatGHS } from "../../lib/format";
import StatusBadge from "../../components/StatusBadge";

const FILTERS = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    listOrders({ status: filter })
      .then(setOrders)
      .catch(() => setError("Couldn't load orders. Check your Supabase connection."))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted">Track and update every order that comes in.</p>

      <div className="mt-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-plum text-white" : "bg-white text-muted hover:bg-line"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-coral-dark">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  Loading orders…
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No orders in this view yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">{order.customer_name}</td>
                <td className="px-4 py-3">{formatGHS(order.total_pesewas)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="text-sm font-medium text-plum hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
