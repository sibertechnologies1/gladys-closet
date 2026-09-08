import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Sync initial input state with existing URL search query if present
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  
  const { cart } = useCart();

  // Favorites state count read from localStorage
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Read count from localStorage and update state
  const updateFavoritesCount = () => {
    const saved = localStorage.getItem("favorite_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFavoritesCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setFavoritesCount(0);
      }
    } else {
      setFavoritesCount(0);
    }
  };

  useEffect(() => {
    updateFavoritesCount();

    // Listen for custom favorited changes across components or tabs
    window.addEventListener("favoritesUpdated", updateFavoritesCount);
    window.addEventListener("storage", updateFavoritesCount);

    return () => {
      window.removeEventListener("favoritesUpdated", updateFavoritesCount);
      window.removeEventListener("storage", updateFavoritesCount);
    };
  }, []);

  // Total quantity of items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Keep input in sync if URL parameter changes elsewhere
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

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
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" },
  ];

  // Check if a link is active based on current path and query string
  const isLinkActive = (href) => {
    const currentUrl = location.pathname + location.search;
    if (href === "/shop") {
      return location.pathname === "/shop" && !location.search;
    }
    return currentUrl === href;
  };

  // Execute Search Navigation
  const executeSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
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
            <form onSubmit={handleFormSubmit} className="relative">
              <button 
                type="submit" 
                aria-label="Search" 
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition ${
                  searchParams.get("search") ? "text-purple-600" : "text-gray-400 hover:text-purple-600"
                }`}
              >
                <FiSearch className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search dresses, shirts, sizes..."
                className={`w-full rounded-lg pl-10 pr-9 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none transition ${
                  searchParams.get("search")
                    ? "bg-purple-50/60 ring-2 ring-purple-500/80 border-transparent"
                    : "bg-gray-100/80 focus:bg-gray-100 focus:ring-1 focus:ring-purple-400 border border-transparent"
                }`}
              />

              {/* Clear Search Button when filter is active */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    navigate("/shop");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full"
                  aria-label="Clear Search"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-6">

            {/* Cart with Badge */}
            <Link to="/cart" className="flex flex-col items-center group relative">
              <div className="relative">
                <FiShoppingBag className={`w-5 h-5 transition ${
                  location.pathname === "/cart" ? "text-purple-600" : "text-gray-700 group-hover:text-purple-600"
                }`} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className={`hidden sm:inline text-[11px] font-medium mt-1 ${
                location.pathname === "/cart" ? "text-purple-600 font-bold" : "text-gray-600"
              }`}>
                Cart
              </span>
            </Link>

            {/* Favorites with Badge */}
            <Link to="/favorites" className="flex flex-col items-center group relative">
              <div className="relative">
                <FiHeart className={`w-5 h-5 transition ${
                  location.pathname === "/favorites" ? "text-purple-600" : "text-gray-700 group-hover:text-purple-600"
                }`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <span className={`hidden sm:inline text-[11px] font-medium mt-1 ${
                location.pathname === "/favorites" ? "text-purple-600 font-bold" : "text-gray-600"
              }`}>
                Favorites
              </span>
            </Link>

            {/* User Avatar / Account */}
            <Link to="/account" className="block pl-1 sm:pl-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                alt="User Profile"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border transition ${
                  location.pathname === "/account" ? "border-purple-600 ring-2 ring-purple-200" : "border-gray-200 hover:border-purple-500"
                }`}
              />
            </Link>

          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleFormSubmit} className="relative">
            <button 
              type="submit" 
              aria-label="Search" 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
            >
              <FiSearch className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products..."
              className="w-full bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-purple-400"
            />
          </form>
        </div>

        {/* Category Navigation Bar - Desktop */}
        <nav className="hidden md:flex space-x-8 pt-4 text-sm font-medium border-t border-gray-50 mt-3">
          {categories.map((cat) => {
            const active = isLinkActive(cat.href);
            return (
              <div
                key={cat.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(cat.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={cat.href}
                  className={`flex items-center gap-1 py-1 transition ${
                    active
                      ? "text-purple-600 font-bold border-b-2 border-purple-600"
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
                      {cat.subcategories.map((sub) => {
                        const subActive = isLinkActive(sub.href);
                        return (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            className={`block px-4 py-2 text-xs font-medium transition ${
                              subActive
                                ? "bg-purple-50 text-purple-700 font-bold"
                                : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col space-y-3 pt-4 pb-2 border-t border-gray-100 mt-3">
            {categories.map((cat) => {
              const active = isLinkActive(cat.href);
              return (
                <div key={cat.name} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Link
                      to={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-base font-medium transition ${
                        active
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
                      {cat.subcategories.map((sub) => {
                        const subActive = isLinkActive(sub.href);
                        return (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block text-sm transition ${
                              subActive
                                ? "text-purple-600 font-bold"
                                : "text-gray-600 hover:text-purple-600"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

      </div>
    </header>
  );
}