
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  getDashboardStats,
  getMonthlySales,
  getMonthlyOrders,
  getMonthlyPendingOrders,
  listOrders,
} from "../../lib/orders";

import { formatGHS } from "../../lib/format";

import StatusBadge from "../../components/StatusBadge";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  const [recentOrders, setRecentOrders] = useState([]);

  const [monthlySales, setMonthlySales] = useState([]);

  const [monthlyOrders, setMonthlyOrders] = useState([]);

  const [monthlyPending, setMonthlyPending] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      listOrders(),
      getMonthlySales(),
      getMonthlyOrders(),
      getMonthlyPendingOrders(),
    ])
      .then(
        ([
          statsData,
          orders,
          salesData,
          ordersData,
          pendingData,
        ]) => {
          setStats(statsData);

          setRecentOrders(orders.slice(0, 6));

          setMonthlySales(salesData);

          setMonthlyOrders(ordersData);

          setMonthlyPending(pendingData);
        }
      )
      .catch((error) => {
        console.error(error);

        setError(
          "Couldn't load dashboard data. Check your Supabase connection."
        );
      });
  }, []);

  /*
    Combine all monthly data into one array.

    Example:

    [
      {
        month: "Apr",
        orders: 12,
        sales: 1500,
        pending: 3
      }
    ]
  */
  const chartData = monthlySales.map((sale) => {
    const orderData = monthlyOrders.find(
      (item) => item.month === sale.month
    );

    const pendingData = monthlyPending.find(
      (item) => item.month === sale.month
    );

    return {
      month: sale.month,

      sales: sale.sales,

      orders: orderData?.orders || 0,

      pending: pendingData?.pending || 0,
    };
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">
        Dashboard
      </h1>

      <p className="mt-1 text-sm text-muted">
        A snapshot of how the store is doing.
      </p>

      {error && (
        <p className="mt-6 text-sm text-coral-dark">
          {error}
        </p>
      )}

      {/* Dashboard statistics */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total orders"
          value={stats ? stats.totalOrders : "—"}
        />

        <StatCard
          label="Total sales"
          value={
            stats
              ? formatGHS(stats.totalSalesPesewas)
              : "—"
          }
        />

        <StatCard
          label="Pending orders"
          value={stats ? stats.pendingCount : "—"}
          accent
        />
      </div>

      {/* ========================= */}
      {/* ORDERS GRAPH */}
      {/* ========================= */}

      <div className="mt-10">
        <h2 className="font-display text-lg font-medium text-ink">
          Orders Overview
        </h2>

        <p className="mt-1 text-sm text-muted">
          Total orders over the last 6 months.
        </p>

        <div className="mt-4 rounded-lg border border-line bg-white p-5">
          <div className="h-[300px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E5E5"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#111827"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* SALES GRAPH */}
      {/* ========================= */}

      <div className="mt-10">
        <h2 className="font-display text-lg font-medium text-ink">
          Sales Overview
        </h2>

        <p className="mt-1 text-sm text-muted">
          Total sales over the last 6 months.
        </p>

        <div className="mt-4 rounded-lg border border-line bg-white p-5">
          <div className="h-[300px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E5E5"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) =>
                    `GH₵${Number(value).toLocaleString(
                      "en-GH",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* PENDING ORDERS GRAPH */}
      {/* ========================= */}

      <div className="mt-10">
        <h2 className="font-display text-lg font-medium text-ink">
          Pending Orders
        </h2>

        <p className="mt-1 text-sm text-muted">
          Pending orders over the last 6 months.
        </p>

        <div className="mt-4 rounded-lg border border-line bg-white p-5">
          <div className="h-[300px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E5E5"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending orders"
                  stroke="#F97316"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* RECENT ORDERS */}
      {/* ========================= */}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">
            Recent orders
          </h2>

          <Link
            to="/admindashboard/orders"
            className="text-sm font-medium text-coral hover:text-coral-dark"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">
                  Customer
                </th>

                <th className="px-4 py-3 font-medium">
                  Total
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 font-medium">
                  Placed
                </th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-muted"
                  >
                    No orders yet. They'll show up here
                    once customers start checking out.
                  </td>
                </tr>
              )}

              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-line"
                >
                  <td className="px-4 py-3">
                    {order.customer_name}
                  </td>

                  <td className="px-4 py-3">
                    {formatGHS(order.total_pesewas)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      status={order.status}
                    />
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
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
      <p className="text-xs uppercase tracking-wide text-muted">
        {label}
      </p>

      <p
        className={`mt-2 font-display text-3xl font-medium ${
          accent ? "text-coral" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

