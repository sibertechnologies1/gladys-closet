import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  FiGrid, 
  FiPackage, 
  FiPlusCircle, 
  FiShoppingBag, 
  FiLogOut, 
  FiExternalLink, 
  FiMenu, 
  FiX 
} from "react-icons/fi";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import logo from "../../pages/admin/logo.jpeg";

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0, pendingOrders: 0 });
  const [salesChartData, setSalesChartData] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);

  const isMainDashboard = location.pathname === "/admin" || location.pathname === "/admin/";

  useEffect(() => {
    if (!isMainDashboard) return;

    async function fetchMetrics() {
      try {
        setLoading(true);
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*");

        console.log("Raw orders from Supabase:", orders);

        if (ordersError) throw ordersError;

        let salesSum = 0;
        let pendingCount = 0;
        const monthlyMap = {};
        const statusMap = {};

        (orders || []).forEach((order) => {
          // Check common column names for total amount
          const rawPrice = order.total_amount ?? order.total ?? order.total_price ?? order.amount ?? 0;
          
          // Parse numeric value if stored as a string or formatted currency
          const cleanedPrice = typeof rawPrice === "string" 
            ? parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 0 
            : Number(rawPrice) || 0;

          salesSum += cleanedPrice;

          if (order.status?.toLowerCase() === "pending") {
            pendingCount += 1;
          }

          const status = order.status || "Pending";
          statusMap[status] = (statusMap[status] || 0) + 1;

          const date = new Date(order.created_at || Date.now());
          const monthLabel = date.toLocaleString("default", { month: "short", year: "2-digit" });
          monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + cleanedPrice;
        });

        const formattedSalesData = Object.keys(monthlyMap).map((key) => ({
          month: key,
          sales: monthlyMap[key],
        }));

        const formattedStatusData = Object.keys(statusMap).map((key) => ({
          status: key,
          count: statusMap[key],
        }));

        setStats({
          totalOrders: orders ? orders.length : 0,
          totalSales: salesSum,
          pendingOrders: pendingCount,
        });
        setSalesChartData(formattedSalesData);
        setStatusChartData(formattedStatusData);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setError("Couldn't load dashboard data. Check your Supabase connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [isMainDashboard]);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: FiGrid, end: true },
    { name: "Products", path: "/admin/products", icon: FiPackage, end: true },
    { name: "Add Product", path: "/admin/products/new", icon: FiPlusCircle, end: false },
    { name: "Orders", path: "/admin/orders", icon: FiShoppingBag, end: false },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50 antialiased">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-gray-900 rounded-xl shrink-0">
            <img 
              src={logo} 
              alt="Gladys' Closet Logo" 
              className="w-8 h-8 object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 leading-tight">
              Gladys' Closet
            </h2>
            <p className="text-[10px] text-purple-700 font-semibold">
              Admin Console
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Responsive Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-5 h-screen shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-2 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-gray-900 rounded-xl shadow-sm shrink-0">
                <img 
                  src={logo} 
                  alt="Gladys' Closet Logo" 
                  className="w-10 h-10 object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 leading-tight">
                  Gladys' Closet
                </h2>
                <p className="text-xs text-purple-700 font-semibold mt-0.5">
                  Admin Console
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
                      isActive
                        ? "bg-purple-700 text-white shadow-md shadow-purple-200"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-100">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition"
          >
            <span>View Live Store</span>
            <FiExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              signOut().then(() => navigate("/admin/login"));
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition w-full text-left"
          >
            <FiLogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {isMainDashboard ? (
            <>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">
                  A snapshot of store sales, orders, and fulfillment activity.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="p-8 text-center text-gray-400 font-semibold text-sm">
                  Loading analytical data...
                </div>
              ) : (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                      <p className="text-3xl font-black text-gray-900 mt-2">{stats.totalOrders}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</p>
                      <p className="text-3xl font-black text-purple-700 mt-2">
                        GHS {stats.totalSales.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Orders</p>
                      <p className="text-3xl font-black text-amber-600 mt-2">{stats.pendingOrders}</p>
                    </div>
                  </div>

                  {/* Visual Analytics Graphs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Revenue Trend</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <Tooltip 
                              formatter={(val) => [`GHS ${val.toLocaleString()}`, "Sales"]}
                              contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="sales" 
                              stroke="#7e22ce" 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: "#7e22ce" }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statusChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="status" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}