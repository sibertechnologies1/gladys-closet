import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiSearch, 
  FiShoppingBag, 
  FiHeart, 
  FiMenu, 
  FiX, 
  FiChevronDown 
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { cart } = useCart();
  const navigate = useNavigate();

  // Total quantity of items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const categories = [
    {
      name: "Women",
      href: "/shop?category=women",
      subcategories: [
        { name: "Dresses & Kente", href: "/shop?category=women&type=dresses" },
        { name: "Tops & Blouses", href: "/shop?category=women&type=tops" },
        { name: "Skirts & Sets", href: "/shop?category=women&type=skirts" },
        { name: "Accessories", href: "/shop?category=women&type=accessories" },
      ],
    },
    {
      name: "Men",
      href: "/shop?category=men",
      subcategories: [
        { name: "Shirts & Polos", href: "/shop?category=men&type=shirts" },
        { name: "Traditional Wear", href: "/shop?category=men&type=traditional" },
        { name: "Trousers & Shorts", href: "/shop?category=men&type=bottoms" },
      ],
    },
    {
      name: "Kids",
      href: "/shop?category=kids",
      subcategories: [
        { name: "Girls Fashion", href: "/shop?category=kids&type=girls" },
        { name: "Boys Fashion", href: "/shop?category=kids&type=boys" },
        { name: "Baby Wear", href: "/shop?category=kids&type=baby" },
      ],
    },
    { name: "Sports", href: "/shop?category=sports" },
    { name: "Brands", href: "/shop?category=brands" },
    { name: "New Arrivals", href: "/shop?sort=newest" },
     { name: "About", href: "/about" },
    { name: "Shop", href: "/shop", isPrimary: true },
  ];

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 left-0 right-0">
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
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Gladys' Closet"
              className="h-9 sm:h-12 w-auto object-contain"
            />
          </Link>

          {/* Search Input - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search dresses, shirts, sizes..."
                className="w-full bg-gray-100/80 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-gray-100 focus:ring-1 focus:ring-purple-400 transition"
              />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Cart with Badge */}
            <Link to="/cart" className="flex flex-col items-center group relative">
              <div className="relative">
                <FiShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[11px] text-gray-600 font-medium mt-1">
                Cart
              </span>
            </Link>

            {/* Favorites */}
            <Link to="/favorites" className="flex flex-col items-center group">
              <FiHeart className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition" />
              <span className="hidden sm:inline text-[11px] text-gray-600 font-medium mt-1">
                Favorites
              </span>
            </Link>

            {/* User Avatar / Account */}
            <Link to="/account" className="block pl-1 sm:pl-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                alt="User Profile"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 hover:border-purple-500 transition"
              />
            </Link>

          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products..."
              className="w-full bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Category Navigation Bar - Desktop */}
        <nav className="hidden md:flex space-x-8 pt-4 text-sm font-medium border-t border-gray-50 mt-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(cat.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={cat.href}
                className={`flex items-center gap-1 py-1 transition ${
                  cat.isPrimary
                    ? "text-purple-600 font-bold hover:text-purple-800"
                    : "text-gray-700 hover:text-purple-600"
                }`}
              >
                {cat.name}
                {cat.subcategories && (
                  <FiChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                )}
              </Link>

              {/* Desktop Dropdown Menu */}
              {cat.subcategories && activeDropdown === cat.name && (
                <div className="absolute left-0 top-full pt-2 w-48 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className="block px-4 py-2 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-700 font-medium transition"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col space-y-3 pt-4 pb-2 border-t border-gray-100 mt-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Link
                    to={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition ${
                      cat.isPrimary
                        ? "text-purple-600 font-bold"
                        : "text-gray-800 hover:text-purple-600"
                    }`}
                  >
                    {cat.name}
                  </Link>
                  {cat.subcategories && (
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === cat.name ? null : cat.name
                        )
                      }
                      className="p-1 text-gray-500"
                    >
                      <FiChevronDown
                        className={`w-4 h-4 transition-transform ${
                          activeDropdown === cat.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Mobile Subcategories */}
                {cat.subcategories && activeDropdown === cat.name && (
                  <div className="pl-4 pt-2 space-y-2 border-l-2 border-purple-100 mt-2">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-gray-600 hover:text-purple-600"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

      </div>
    </header>
  );
}