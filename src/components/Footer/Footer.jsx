import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
  FiGlobe,
} from "react-icons/fi";
import { FaWhatsapp, FaTiktok, FaPinterestP } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import defaultLogo from "../../assets/logo.png";

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [navLinks, setNavLinks] = useState([]);
  const [categoryLinks, setCategoryLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);

  // States for DevelopedBy
  const [orderDevelopedByText, setorderDevelopedByText] = useState("");
  const [orderDevelopedByLink, setorderDevelopedByLink] = useState("");
  const [orderDevelopedByPosition, setorderDevelopedByPosition] = useState("right");

  useEffect(() => {
    fetchFooterData();
  }, []);

  async function fetchFooterData() {
    // 1. Fetch store settings
    const { data: settingsData, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) console.error("Error fetching store_settings:", error);

    if (settingsData) {
      setSettings(settingsData);

      // Map values to DevelopedBy states with sensible fallbacks
      setorderDevelopedByText(
        settingsData.developed_by_text ||
        settingsData.developed_by_text ||
        "Developed By Ebenezer Boadzie Tiroug"
      );
      setorderDevelopedByLink(
        settingsData.developed_by_link ||
        settingsData.developed_by_link ||
        "#"
      );
      setorderDevelopedByPosition(
        settingsData.developed_by_position ||
        settingsData.developed_by_position ||
        "right"
      );

      // Categories
      if (Array.isArray(settingsData.footer_categories) && settingsData.footer_categories.length > 0) {
        setCategoryLinks(settingsData.footer_categories);
      } else {
        setCategoryLinks([]);
      }
    }

    // Fetch active navigation links
    const { data: navData } = await supabase
      .from("navigation_tabs")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });
    if (navData) setNavLinks(navData);

    // Fetch social media links
    const { data: socialData } = await supabase
      .from("social_links")
      .select("*")
      .order("order_index", { ascending: true });
    if (socialData) setSocialLinks(socialData);
  }

  // Position matchers
  const isMiddlePosition = (pos) => {
    if (!pos) return false;
    const p = String(pos).toLowerCase();
    return (
      p === "middle" ||
      p === "bottom-center" ||
      p === "bottom_center" ||
      p.includes("above copyright") ||
      p.includes("bottom center")
    );
  };

  const isBrandPosition = (pos) => {
    if (!pos) return false;
    const p = String(pos).toLowerCase();
    return p === "brand" || p.includes("brand");
  };

  const isBottomRowPosition = (pos) => {
    if (!pos) return true; // Default to bottom row if position is unspecified
    const p = String(pos).toLowerCase();
    return (
      p === "right" ||
      p === "left" ||
      p === "bottom-right" ||
      p === "bottom_right" ||
      p === "bottom-left" ||
      p === "bottom_left" ||
      p.includes("bottom right") ||
      p.includes("bottom left")
    );
  };

  // Render Social Icon Helper
  const renderSocialIcon = (item) => {
    if (item.icon_type === "custom" && item.custom_icon_url) {
      return (
        <img
          src={item.custom_icon_url}
          alt={item.platform}
          className="w-4 h-4 object-contain"
        />
      );
    }

    switch (item.platform?.toLowerCase()) {
      case "instagram": return <FiInstagram className="w-4 h-4" />;
      case "tiktok": return <FaTiktok className="w-4 h-4" />;
      case "whatsapp": return <FaWhatsapp className="w-4 h-4" />;
      case "facebook": return <FiFacebook className="w-4 h-4" />;
      case "twitter": return <FiTwitter className="w-4 h-4" />;
      case "youtube": return <FiYoutube className="w-4 h-4" />;
      case "linkedin": return <FiLinkedin className="w-4 h-4" />;
      case "pinterest": return <FaPinterestP className="w-4 h-4" />;
      default: return <FiGlobe className="w-4 h-4" />;
    }
  };

  // WhatsApp Link Helper
  const getSocialUrl = (platform, url) => {
    if (!url) return "#";
    if (platform?.toLowerCase() === "whatsapp" && !url.startsWith("http")) {
      return `https://wa.me/${url.replace(/[^0-9]/g, "")}`;
    }
    return url;
  };

  // Logo Settings
  const logoUrl = settings?.logo_url || defaultLogo;
  const logoPosition = settings?.logo_position || "brand";
  const logoAlign = settings?.logo_align || "left";
  const logoHeight = settings?.logo_height || 48;
  const logoVisible = settings?.logo_visible ?? true;

  const getAlignClass = (align) => {
    if (align === "center") return "flex justify-center text-center";
    if (align === "right") return "flex justify-end text-right";
    return "flex justify-start text-left";
  };

  const renderLogo = () => {
    if (!logoVisible) return null;
    return (
      <div className={`w-full ${getAlignClass(logoAlign)}`}>
        <Link to="/" className="inline-block">
          <img
            src={logoUrl}
            alt="Store Logo"
            style={{ height: `${logoHeight}px` }}
            className="w-auto object-contain"
          />
        </Link>
      </div>
    );
  };

  // Text & Titles
  const description = settings?.footer_description || "High-end apparel and luxury accessories curated for your style.";
  const address = settings?.contact_address;
  const phone = settings?.contact_phone;
  const email = settings?.contact_email;

  const footerNavTitle = settings?.footer_nav_title || "Navigation";
  const footerCatTitle = settings?.footer_cat_title || "Categories";
  const footerContactTitle = settings?.footer_contact_title || "Contact Us";

  // Column Visibility & Order
  const showBrandCol = settings?.show_brand_col ?? true;
  const showNavCol = settings?.show_nav_col ?? true;
  const showCatCol = settings?.show_cat_col ?? true;
  const showContactCol = settings?.show_contact_col ?? true;

  const orderBrandCol = settings?.order_brand_col || 1;
  const orderNavCol = settings?.order_nav_col || 2;
  const orderCatCol = settings?.order_cat_col || 3;
  const orderContactCol = settings?.order_contact_col || 4;

  // Bottom Settings
  const copyrightText = settings?.copyright_text || "Gladys Closet. All rights reserved.";
  const privacyPolicyLink = settings?.privacy_policy_link || "/privacy";
  const termsServiceLink = settings?.terms_service_link || "/terms";

  const showCopyright = settings?.show_copyright ?? true;
  const showLegalLinks = settings?.show_legal_links ?? true;
  const showDevelopedBy = settings?.show_developed_by ?? settings?.show_developed_by ?? true;
  const bottomLayout = settings?.bottom_layout || "between";

  const orderCopyright = settings?.order_copyright || 1;
  const orderLegalLinks = settings?.order_legal_links || 2;
  const orderDevelopedBy = settings?.order_developed_by || settings?.order_developed_by || 3;

  // Render Helper for Developed By Text
  const renderDevelopedBy = () => {
    if (!showDevelopedBy || !orderDevelopedByText) return null;
    return (
      <span className="text-gray-400 text-xs">
        {orderDevelopedByLink && orderDevelopedByLink !== "#" ? (
          <a
            href={orderDevelopedByLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition underline underline-offset-2"
          >
            {orderDevelopedByText}
          </a>
        ) : (
          orderDevelopedByText
        )}
      </span>
    );
  };

  const getBottomContainerStyle = () => {
    if (bottomLayout === "center") return "flex flex-wrap justify-center items-center gap-6 text-center";
    if (bottomLayout === "stack") return "flex flex-col items-center justify-center gap-3 text-center";
    return "flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left";
  };

  return (
    <footer className="w-full bg-[#0f172a] text-gray-300 border-t border-purple-900/50 mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        
        {/* LOGO (Positioned Top) */}
        {logoPosition === "top" && (
          <div className="border-b border-white/10 pb-6">
            {renderLogo()}
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          {showBrandCol && (
            <div
              style={{ order: orderBrandCol }}
              className="col-span-2 lg:col-span-1 space-y-4"
            >
              {logoPosition === "brand" && renderLogo()}

              {description && (
                <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                  {description}
                </p>
              )}

              {/* Dynamic Position: Brand Column */}
              {isBrandPosition(orderDevelopedByPosition) && (
                <div className="pt-1">{renderDevelopedBy()}</div>
              )}

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socialLinks.map((item) => (
                    <a
                      key={item.id}
                      href={getSocialUrl(item.platform, item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.platform}
                      className="p-2.5 bg-white/10 rounded-full border border-white/10 text-white hover:bg-purple-600 hover:text-slate-900 hover:border-purple-600 transition duration-200 flex items-center justify-center"
                    >
                      {renderSocialIcon(item)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Column */}
          {showNavCol && (
            <div style={{ order: orderNavCol }} className="col-span-1">
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">
                {footerNavTitle}
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li>
                  <Link to="/" className="hover:text-purple-600 transition">
                    Home
                  </Link>
                </li>
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <Link to={link.href} className="hover:text-purple-600 transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Categories Column */}
          {showCatCol && (
            <div style={{ order: orderCatCol }} className="col-span-1">
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">
                {footerCatTitle}
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {categoryLinks.map((cat) => (
                  <li key={cat.id || cat.href || cat.label}>
                    <Link to={cat.href} className="hover:text-purple-600 transition">
                      {cat.label}
                    </Link>
                  </li>
                ))}
                {categoryLinks.length === 0 && (
                  <li className="text-xs text-gray-500 italic">No categories added</li>
                )}
              </ul>
            </div>
          )}

          {/* Contact Info Column */}
          {showContactCol && (
            <div style={{ order: orderContactCol }} className="col-span-2 lg:col-span-1">
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">
                {footerContactTitle}
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {address && (
                  <li className="flex items-start gap-3">
                    <FiMapPin className="text-purple-600 w-4 h-4 shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </li>
                )}
                {phone && (
                  <li className="flex items-center gap-3">
                    <FiPhone className="text-purple-600 w-4 h-4 shrink-0" />
                    <a href={`tel:${phone}`} className="hover:text-purple-600 transition">
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-3">
                    <FiMail className="text-purple-600 w-4 h-4 shrink-0" />
                    <a href={`mailto:${email}`} className="hover:text-purple-600 transition truncate">
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

        </div>

        {/* Dynamic Position: Bottom Center (Above Copyright Bar) */}
        {isMiddlePosition(orderDevelopedByPosition) && showDevelopedBy && (
          <div className="text-center pt-6 border-t border-white/10">
            {renderDevelopedBy()}
          </div>
        )}

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          
          {logoPosition === "bottom-center" && (
            <div className="mb-4">{renderLogo()}</div>
          )}

          <div className={getBottomContainerStyle()}>
            
            {logoPosition === "bottom-left" && (
              <div className="shrink-0">{renderLogo()}</div>
            )}

            {/* Copyright */}
            {showCopyright && (
              <p style={{ order: orderCopyright }} className="text-xs text-gray-400">
                © {new Date().getFullYear()} {copyrightText}
              </p>
            )}

            {/* Legal Links */}
            {showLegalLinks && (
              <div style={{ order: orderLegalLinks }} className="flex space-x-6 text-xs text-gray-400">
                <Link to={privacyPolicyLink} className="hover:text-gray-200 transition">
                  Privacy Policy
                </Link>
                <Link to={termsServiceLink} className="hover:text-gray-200 transition">
                  Terms of Service
                </Link>
              </div>
            )}

            {/* Dynamic Position: Bottom Row (Left, Right, Bottom Right) */}
            {isBottomRowPosition(orderDevelopedByPosition) && !isMiddlePosition(orderDevelopedByPosition) && showDevelopedBy && (
              <div style={{ order: orderDevelopedBy }}>
                {renderDevelopedBy()}
              </div>
            )}

          </div>
        </div>

      </div>
    </footer>
  );
}