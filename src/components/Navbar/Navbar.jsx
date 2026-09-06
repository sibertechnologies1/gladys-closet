import { useState } from "react";
import { FiSearch, FiShoppingBag, FiHeart, FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { name: "Women", href: "#" },
    { name: "Men", href: "#" },
    { name: "Kids", href: "#" },
    { name: "Sports", href: "#" },
    { name: "Brands", href: "#" },
    { name: "New", href: "#" },
    { name: "Sale", href: "#", isSale: true },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-black"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <a href="#" className="flex items-center">
            <img
              src={logo}
              alt="Gladys' Closet"
              className="h-9 sm:h-12 w-auto object-contain"
            />
          </a>

          {/* Search Input - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100/80 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 focus:ring-1 focus:ring-gray-300 transition"
              />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Cart with Badge */}
            <a href="#" className="flex flex-col items-center group relative">
              <div className="relative">
                <FiShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-black transition" />
                <span className="absolute -top-1.5 -right-2 bg-amber-300 text-gray-900 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  4
                </span>
              </div>
              <span className="hidden sm:inline text-[11px] text-gray-600 font-medium mt-1">
                Cart
              </span>
            </a>

            {/* Favorites */}
            <a href="#" className="flex flex-col items-center group">
              <FiHeart className="w-5 h-5 text-gray-700 group-hover:text-black transition" />
              <span className="hidden sm:inline text-[11px] text-gray-600 font-medium mt-1">
                Favorites
              </span>
            </a>

            {/* User Avatar */}
            <a href="#" className="block pl-1 sm:pl-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                alt="User Profile"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
              />
            </a>

          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Category Navigation Bar - Desktop */}
        <nav className="hidden md:flex space-x-8 pt-4 text-sm font-medium border-t border-gray-50 mt-3">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={cat.href}
              className={`transition ${
                cat.isSale
                  ? "text-pink-500 font-semibold hover:text-pink-600"
                  : "text-gray-700 hover:text-amber-600"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </nav>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col space-y-3 pt-4 pb-2 border-t border-gray-100 mt-3">
            {categories.map((cat) => (
              <a
                key={cat.name}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition ${
                  cat.isSale
                    ? "text-pink-500 font-semibold"
                    : "text-gray-800 hover:text-amber-600"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </nav>
        )}

      </div>
    </header>
  );
}