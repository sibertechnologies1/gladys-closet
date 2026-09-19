import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listOrders } from "../../lib/orders";
import { formatGHS } from "../../lib/format";
import StatusBadge from "../../components/StatusBadge";

const FILTERS = [
  "all",
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    listOrders({ status: filter })
      .then(setOrders)
      .catch(() =>
        setError(
          "Couldn't load orders. Check your Supabase connection."
        )
      )
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
          Orders
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Track and update every order that comes in.
        </p>
      </div>

      {/* Order Filters (Horizontally scrollable on small screens) */}
      <div className="mt-4 sm:mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium capitalize whitespace-nowrap transition-colors shrink-0 ${
              filter === f
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm">
          Loading orders…
        </div>
      )}

      {!loading && (
        <>
          {/* Mobile View: Order Cards (Shown on screens smaller than md) */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:hidden">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 text-sm">
                No orders in this view yet.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm">
                        {order.customer_name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <hr className="border-gray-50" />

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs text-gray-400 block">Total</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatGHS(order.total_pesewas)}
                      </span>
                    </div>

                    <Link
                      to={`/admindashboard/orders/${order.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-50 text-purple-600 font-semibold text-xs hover:bg-purple-100 transition"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop/Tablet View: Table (Shown on md screens and larger) */}
          <div className="mt-4 hidden md:block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Placed</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No orders in this view yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {order.customer_name}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatGHS(order.total_pesewas)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>

                      {/* View Order */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admindashboard/orders/${order.id}`}
                          className="text-xs font-semibold text-purple-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}