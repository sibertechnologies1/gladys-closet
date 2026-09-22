import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { 
  FiSearch, 
  FiShoppingBag, 
  FiHeart, 
  FiMenu, 
  FiX, 
  FiChevronDown,
  FiChevronRight,
  FiLogIn,
  FiCamera
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import VisualSearchModal from "../../components/VisualSearchModal/VisualSearchModal";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("women");
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const auth = useAuth?.() || {};
  const [user, setUser] = useState(auth.user || null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const { cart } = useCart();
  const [favoritesCount, setFavoritesCount] = useState(0);

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

    window.addEventListener("favoritesUpdated", updateFavoritesCount);
    window.addEventListener("storage", updateFavoritesCount);

    return () => {
      window.removeEventListener("favoritesUpdated", updateFavoritesCount);
      window.removeEventListener("storage", updateFavoritesCount);
    };
  }, []);

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const displayedFavoritesCount = favoritesCount;

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Structured data tailored for the mega-menu
  const megaMenuData = {
    women: {
      title: "Women's Collection",
      href: "/shop?category=women",
      sections: [
        {
          heading: "Clothing",
          items: [
            { name: "Dresses & Kente", href: "/shop?category=women&type=dresses" },
            { name: "Tops & Blouses", href: "/shop?category=women&type=tops" },
            { name: "Skirts & Sets", href: "/shop?category=women&type=skirts" },
            { name: "Jumpsuits", href: "/shop?category=women&type=jumpsuits" },
          ],
        },
        {
          heading: "Accessories",
          items: [
            { name: "Bags & Purses", href: "/shop?category=women&type=bags" },
            { name: "Jewelry", href: "/shop?category=women&type=jewelry" },
            { name: "Headwraps", href: "/shop?category=women&type=headwraps" },
            { name: "Belts", href: "/shop?category=women&type=belts" },
          ],
        },
        {
          heading: "Footwear",
          items: [
            { name: "Heels & Pumps", href: "/shop?category=women&type=heels" },
            { name: "Flats & Sandals", href: "/shop?category=women&type=flats" },
            { name: "Traditional Slippers", href: "/shop?category=women&type=slippers" },
          ],
        },
      ],
      brands: [
        { name: "Zara", href: "/brands?name=zara" },
        { name: "Mango", href: "/brands?name=mango" },
        { name: "Kiki Clothing", href: "/brands?name=kiki" },
        { name: "Woodin", href: "/brands?name=woodin" },
      ],
      promo: {
        title: "New Season Kente Outfits",
        subtitle: "Handcrafted traditional styles now in stock",
        href: "/newarrivals?category=women",
        bgClass: "from-purple-600 to-indigo-700",
      },
    },
    men: {
      title: "Men's Collection",
      href: "/shop?category=men",
      sections: [
        {
          heading: "Clothing",
          items: [
            { name: "Shirts & Polos", href: "/shop?category=men&type=shirts" },
            { name: "Traditional Kaftans", href: "/shop?category=men&type=traditional" },
            { name: "Trousers & Shorts", href: "/shop?category=men&type=bottoms" },
            { name: "Suits & Blazers", href: "/shop?category=men&type=suits" },
          ],
        },
        {
          heading: "Accessories",
          items: [
            { name: "Watches", href: "/shop?category=men&type=watches" },
            { name: "Leather Belts", href: "/shop?category=men&type=belts" },
            { name: "Wallets", href: "/shop?category=men&type=wallets" },
          ],
        },
        {
          heading: "Footwear",
          items: [
            { name: "Loafers & Oxfords", href: "/shop?category=men&type=loafers" },
            { name: "Sneakers", href: "/shop?category=men&type=sneakers" },
            { name: "Native Sandals", href: "/shop?category=men&type=sandals" },
          ],
        },
      ],
      brands: [
        { name: "Nike", href: "/brands?name=nike" },
        { name: "Adidas", href: "/brands?name=adidas" },
        { name: "GTP", href: "/brands?name=gtp" },
        { name: "Caveman", href: "/brands?name=caveman" },
      ],
      promo: {
        title: "Groom & Traditional Attire",
        subtitle: "Premium African wear designed for occasions",
        href: "/shop?category=men&type=traditional",
        bgClass: "from-amber-600 to-orange-700",
      },
    },
    kids: {
      title: "Kids' Collection",
      href: "/shop?category=kids",
      sections: [
        {
          heading: "Girls",
          items: [
            { name: "Dresses", href: "/shop?category=kids&type=girls-dresses" },
            { name: "Tops & Sets", href: "/shop?category=kids&type=girls-sets" },
            { name: "Shoes", href: "/shop?category=kids&type=girls-shoes" },
          ],
        },
        {
          heading: "Boys",
          items: [
            { name: "Shirts & Tees", href: "/shop?category=kids&type=boys-shirts" },
            { name: "Shorts & Trousers", href: "/shop?category=kids&type=boys-bottoms" },
            { name: "Shoes & Sneakers", href: "/shop?category=kids&type=boys-shoes" },
          ],
        },
        {
          heading: "Baby & Toddler",
          items: [
            { name: "Onesies & Rompers", href: "/shop?category=kids&type=onesies" },
            { name: "Gift Sets", href: "/shop?category=kids&type=giftsets" },
          ],
        },
      ],
      brands: [
        { name: "Carter's", href: "/brands?name=carters" },
        { name: "HM Kids", href: "/brands?name=hm-kids" },
      ],
      promo: {
        title: "Back to School Wear",
        subtitle: "Durable & stylish clothes for all ages",
        href: "/shop?category=kids",
        bgClass: "from-pink-500 to-rose-600",
      },
    },
  };

  const activeMegaContent = megaMenuData[selectedCategory] || megaMenuData.women;

  const isLinkActive = (href) => {
    const currentUrl = location.pathname + location.search;
    if (href === "/shop") {
      return location.pathname === "/shop" && !location.search;
    }
    return currentUrl === href;
  };

  const executeSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setMegaMenuOpen(false);
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

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = user?.user_metadata?.full_name || user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2 sm:gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-black"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Gladys' Closet"
                className="h-9 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <form onSubmit={handleFormSubmit} className="relative flex items-center">
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
                  className={`w-full rounded-lg pl-10 pr-16 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none transition ${
                    searchParams.get("search")
                      ? "bg-purple-50/60 ring-2 ring-purple-500/80 border-transparent"
                      : "bg-gray-100/80 focus:bg-gray-100 focus:ring-1 focus:ring-purple-400 border border-transparent"
                  }`}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        navigate("/shop");
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                      aria-label="Clear Search"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsVisualSearchOpen(true)}
                    className="text-gray-400 hover:text-purple-600 p-1 transition"
                    title="Search by image"
                    aria-label="Search by image"
                  >
                    <FiCamera className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
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

              <Link to="/favorites" className="flex flex-col items-center group relative">
                <div className="relative">
                  <FiHeart className={`w-5 h-5 transition ${
                    location.pathname === "/favorites" ? "text-purple-600" : "text-gray-700 group-hover:text-purple-600"
                  }`} />
                  {displayedFavoritesCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {displayedFavoritesCount}
                    </span>
                  )}
                </div>
                <span className={`hidden sm:inline text-[11px] font-medium mt-1 ${
                  location.pathname === "/favorites" ? "text-purple-600 font-bold" : "text-gray-600"
                }`}>
                  Favorites
                </span>
              </Link>

              {user ? (
                <Link to="/dashboard" className="flex flex-col items-center group">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className={`w-8 h-8 rounded-full object-cover border transition ${
                        location.pathname === "/dashboard"
                          ? "border-purple-600 ring-2 ring-purple-200"
                          : "border-gray-200 group-hover:border-purple-500"
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs border transition ${
                        location.pathname === "/dashboard"
                          ? "ring-2 ring-purple-200 border-purple-800"
                          : "border-purple-600 group-hover:bg-purple-700"
                      }`}
                    >
                      {userInitials}
                    </div>
                  )}
                  <span className={`hidden sm:inline text-[11px] font-medium mt-1 ${
                    location.pathname === "/dashboard" ? "text-purple-600 font-bold" : "text-gray-600"
                  }`}>
                    Account
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 pl-1 border-l border-gray-200 sm:pl-3">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-purple-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FiLogIn className="w-4 h-4 text-purple-600" />
                    <span>Log In</span>
                  </Link>

                  <Link
                    to="/signup"
                    className="hidden sm:inline-flex text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-1.5 rounded-lg shadow-sm transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 md:hidden">
            <form onSubmit={handleFormSubmit} className="relative flex items-center">
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
                className="w-full bg-gray-100 rounded-lg pl-9 pr-10 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => setIsVisualSearchOpen(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 p-1 transition"
                title="Search by image"
              >
                <FiCamera className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Desktop Nav Bar with Mega-Menu Trigger */}
          <nav className="hidden md:flex items-center space-x-8 pt-3 text-sm font-medium border-t border-gray-50 mt-3 relative">
            <Link to="/" className={`py-1 ${isLinkActive('/') ? "text-purple-600 font-bold" : "text-gray-700 hover:text-purple-600"}`}>
              Home
            </Link>

            {/* Shop Categories (Mega Menu Trigger) */}
            <div
              className="relative py-1 cursor-pointer"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <span className={`flex items-center gap-1 transition ${
                megaMenuOpen ? "text-purple-600 font-bold" : "text-gray-700 hover:text-purple-600"
              }`}>
                Shop Categories
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
              </span>

              {/* Mega-Menu Panel */}
              {megaMenuOpen && (
                <div className="absolute left-0 top-full pt-2 w-[850px] z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex min-h-[380px]">
                    
                    {/* Left Sidebar (Categories Switcher) */}
                    <div className="w-48 bg-gray-50 border-r border-gray-100 py-4 flex flex-col gap-1">
                      {Object.keys(megaMenuData).map((catKey) => {
                        const isSelected = selectedCategory === catKey;
                        return (
                          <div
                            key={catKey}
                            onMouseEnter={() => setSelectedCategory(catKey)}
                            onClick={() => {
                              navigate(megaMenuData[catKey].href);
                              setMegaMenuOpen(false);
                            }}
                            className={`flex items-center justify-between px-5 py-3 text-sm font-bold capitalize cursor-pointer transition ${
                              isSelected
                                ? "bg-white text-purple-600 border-l-4 border-purple-600 shadow-sm"
                                : "text-gray-600 hover:text-purple-600 hover:bg-gray-100/50"
                            }`}
                          >
                            <span>{catKey}</span>
                            <FiChevronRight className={`w-4 h-4 ${isSelected ? "text-purple-600" : "text-gray-400"}`} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Middle Content (Sub-categories & Brands) */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                          <h4 className="font-extrabold text-gray-900 text-base">{activeMegaContent.title}</h4>
                          <Link
                            to={activeMegaContent.href}
                            onClick={() => setMegaMenuOpen(false)}
                            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                          >
                            Shop All {activeMegaContent.title} <FiChevronRight className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Sub-categories Grid */}
                        <div className="grid grid-cols-3 gap-6">
                          {activeMegaContent.sections.map((sec) => (
                            <div key={sec.heading}>
                              <h5 className="text-xs font-extrabold text-purple-600 uppercase tracking-wider mb-2">
                                {sec.heading}
                              </h5>
                              <ul className="space-y-2">
                                {sec.items.map((item) => (
                                  <li key={item.name}>
                                    <Link
                                      to={item.href}
                                      onClick={() => setMegaMenuOpen(false)}
                                      className="text-xs text-gray-600 hover:text-purple-700 hover:font-semibold transition block"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Featured Brands Horizontal Section */}
                      {activeMegaContent.brands && (
                        <div className="pt-4 border-t border-gray-100 mt-4">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                            Featured Brands
                          </span>
                          <div className="flex items-center gap-3">
                            {activeMegaContent.brands.map((b) => (
                              <Link
                                key={b.name}
                                to={b.href}
                                onClick={() => setMegaMenuOpen(false)}
                                className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 text-xs font-bold text-gray-700 hover:text-purple-700 rounded-lg transition"
                              >
                                {b.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Promotional Card */}
                    {activeMegaContent.promo && (
                      <div className={`w-56 p-5 bg-gradient-to-br ${activeMegaContent.promo.bgClass} text-white flex flex-col justify-between`}>
                        <div>
                          <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Featured
                          </span>
                          <h4 className="font-extrabold text-lg mt-3 leading-snug">{activeMegaContent.promo.title}</h4>
                          <p className="text-xs text-white/80 mt-1">{activeMegaContent.promo.subtitle}</p>
                        </div>
                        <Link
                          to={activeMegaContent.promo.href}
                          onClick={() => setMegaMenuOpen(false)}
                          className="w-full text-center py-2 bg-white text-gray-900 text-xs font-bold rounded-xl shadow-md hover:bg-gray-100 transition"
                        >
                          Explore Now
                        </Link>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>

            <Link to="/brands" className={`py-1 ${isLinkActive('/brands') ? "text-purple-600 font-bold" : "text-gray-700 hover:text-purple-600"}`}>
              Brands
            </Link>
            <Link to="/newarrivals?sort=newest" className={`py-1 ${isLinkActive('/newarrivals?sort=newest') ? "text-purple-600 font-bold" : "text-gray-700 hover:text-purple-600"}`}>
              New Arrivals
            </Link>
            <Link to="/about" className={`py-1 ${isLinkActive('/about') ? "text-purple-600 font-bold" : "text-gray-700 hover:text-purple-600"}`}>
              About
            </Link>
            <Link to="/contact" className={`py-1 ${isLinkActive('/contact') ? "text-purple-600 font-bold" : "text-gray-700 hover:text-purple-600"}`}>
              Contact
            </Link>
          </nav>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden flex flex-col space-y-3 pt-4 pb-2 border-t border-gray-100 mt-3">
              {!user && (
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-bold text-white bg-purple-600 rounded-lg"
                  >
                    Create Account
                  </Link>
                </div>
              )}

              {Object.entries(megaMenuData).map(([catKey, catData]) => (
                <div key={catKey} className="flex flex-col border-b border-gray-50 pb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={catData.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-bold capitalize text-gray-800"
                    >
                      {catKey}
                    </Link>
                  </div>
                  <div className="pl-3 pt-1 space-y-1">
                    {catData.sections.map((sec) => (
                      <div key={sec.heading} className="mt-1">
                        <span className="text-[11px] font-bold text-purple-600 uppercase">{sec.heading}</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {sec.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          )}

        </div>
      </header>

      {/* Visual Search Upload Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />
    </>
  );
}