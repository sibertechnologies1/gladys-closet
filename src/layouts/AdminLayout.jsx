import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-64 flex-col justify-between bg-plum px-6 py-8">
        <div>
          <p className="font-display text-2xl font-medium text-white">Gladys' Closet</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-white/50">Admin</p>

          <nav className="mt-10 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="truncate text-xs text-white/50">{user?.email}</p>
          <button
            onClick={signOut}
            className="mt-2 text-sm font-medium text-white/80 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
