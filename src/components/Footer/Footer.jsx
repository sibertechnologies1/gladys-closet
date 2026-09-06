import { FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook } from "react-icons/fi";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300 border-t border-purple-900/50 mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        
        {/* Responsive Grid: 1 col on mobile, 2 col on small screens, 4 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <a href="#" className="inline-block">
              <img 
                src={logo} 
                alt="Gladys' Closet Logo" 
                className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
              />
            </a>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              High-end apparel, tailored kaftans, and luxury accessories curated for your style.
            </p>
            <div className="flex space-x-3 pt-2">
              <a 
                href="#" 
                aria-label="Instagram"
                className="p-2.5 bg-white/10 rounded-full border border-white/10 text-white hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 transition duration-200"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                aria-label="Facebook"
                className="p-2.5 bg-white/10 rounded-full border border-white/10 text-white hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 transition duration-200"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><a href="#" className="hover:text-amber-300 transition">Home</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">Shop All</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">About Us</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><a href="#" className="hover:text-amber-300 transition">Women</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">Men</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">Kids</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">Sports</a></li>
              <li>
                <a href="#" className="text-pink-400 font-semibold hover:text-pink-300 transition">
                  Sale Items
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-amber-400 w-4 h-4 shrink-0 mt-0.5" />
                <span>Accra, Ghana</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-amber-400 w-4 h-4 shrink-0" />
                <a href="tel:0595805215" className="hover:text-amber-300 transition">
                  0595805215
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-amber-400 w-4 h-4 shrink-0" />
                <a 
                  href="mailto:gladyscloset61@gmail.com" 
                  className="hover:text-amber-300 transition truncate"
                >
                  gladyscloset61@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} Gladys' Closet. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-200 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-200 transition">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}