import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [monthlyPending, setMonthlyPending] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLowStock() {
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .lte("stock", 5);

      if (!error && data) {
        setLowStockCount(data.length);
      }
    }

    fetchLowStock();

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

  const averageOrderValue =
    stats && stats.totalOrders > 0
      ? stats.totalSalesPesewas / stats.totalOrders
      : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            A real-time performance overview for your store.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-coral/10 p-4 border border-coral/20 text-xs sm:text-sm text-coral-dark flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total orders"
          value={stats ? stats.totalOrders : "—"}
          accentColor="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />

        <StatCard
          label="Total sales"
          value={stats ? formatGHS(stats.totalSalesPesewas) : "—"}
          accentColor="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          label="Avg. order value"
          value={stats ? formatGHS(averageOrderValue) : "—"}
          accentColor="sky"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <StatCard
          label="Pending orders"
          value={stats ? stats.pendingCount : "—"}
          accentColor="amber"
          highlight={stats?.pendingCount > 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          label="Low stock items"
          value={lowStockCount}
          accentColor="rose"
          highlight={lowStockCount > 0}
          className="sm:col-span-2 lg:col-span-1"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* CHARTS GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SALES GRAPH */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-6">
            <div>
              <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                Sales Performance
              </h2>
              <p className="text-xs text-muted">
                Revenue trends across the last 6 months.
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
              Monthly Revenue
            </span>
          </div>

          <div className="h-[280px] sm:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dx={-10} />
                <Tooltip content={<CustomTooltip currency />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ORDERS GRAPH */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs">
          <div className="mb-6">
            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
              Volume Overview
            </h2>
            <p className="text-xs text-muted">Total completed orders per month.</p>
          </div>

          <div className="h-[240px] sm:h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ordersGradient)"
                  activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PENDING ORDERS GRAPH */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs">
          <div className="mb-6">
            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
              Pending Queue
            </h2>
            <p className="text-xs text-muted">Unfulfilled orders history.</p>
          </div>

          <div className="h-[240px] sm:h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pendingGradient)"
                  activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS SECTION */}
      <div className="bg-white rounded-2xl border border-line shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-5 border-b border-line mb-4">
          <div>
            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
              Recent Activity
            </h2>
            <p className="text-xs text-muted">Latest purchases processed on the platform.</p>
          </div>

          <Link
            to="/admindashboard/orders"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-coral hover:text-coral-dark transition-colors"
          >
            <span>View all</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* MOBILE CARD VIEW (< md) */}
        <div className="md:hidden space-y-3">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              No orders yet. They'll show up here once customers start checking out.
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-line bg-canvas/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink text-sm">
                    {order.customer_name}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-line/60">
                  <span className="font-semibold text-ink">
                    {formatGHS(order.total_pesewas)}
                  </span>
                  <span className="text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (≥ md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted border-b border-line">
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Placed</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-muted text-xs"
                  >
                    No orders yet. They'll show up here once customers start checking out.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="py-3.5 font-medium text-ink">{order.customer_name}</td>
                    <td className="py-3.5 text-ink/80">{formatGHS(order.total_pesewas)}</td>
                    <td className="py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 text-muted text-xs text-right">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Custom Styled Component for Cards
function StatCard({ label, value, icon, accentColor = "indigo", highlight = false, className = "" }) {
  const colorMap = {
    indigo: { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", bar: "bg-indigo-500" },
    emerald: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", bar: "bg-emerald-500" },
    sky: { text: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100", bar: "bg-sky-500" },
    amber: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", bar: "bg-amber-500" },
    rose: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", bar: "bg-rose-500" },
  };

  const currentTheme = colorMap[accentColor] || colorMap.indigo;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-xs flex flex-col justify-between ${className}`}>
      {/* Top indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${currentTheme.bar}`} />

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider font-semibold text-muted">
          {label}
        </p>
        <div className={`p-2 rounded-xl ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} border`}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <p className={`font-display text-2xl sm:text-3xl font-semibold tracking-tight ${highlight ? "text-coral" : "text-ink"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Custom Chart Tooltip
function CustomTooltip({ active, payload, label, currency = false }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const formattedValue = currency
      ? `GH₵${Number(data.value).toLocaleString("en-GH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : data.value;

    return (
      <div className="bg-ink text-white px-3 py-2 rounded-lg text-xs shadow-lg space-y-0.5">
        <p className="text-white/60 font-medium">{label}</p>
        <p className="font-semibold text-sm">
          {data.name}: <span className="text-white">{formattedValue}</span>
        </p>
      </div>
    );
  }
  return null;
}