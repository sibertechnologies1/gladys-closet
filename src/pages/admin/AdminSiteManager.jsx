import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminSiteManager() {
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'socials' | 'nav' | 'categories' | 'pages'

  // Loading States
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);
  const [addingSocial, setAddingSocial] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);

  // Logo States
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  // Footer & Contact States
  const [footerDescription, setFooterDescription] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // developed by States
  const [orderDevelopedByText, setorderDevelopedByText] = useState("");
  const [orderDevelopedByLink, setorderDevelopedByLink] = useState("");
  const [orderDevelopedByPosition, setorderDevelopedByPosition] = useState("right");

  // Dynamic Social Links
  const [socials, setSocials] = useState([]);
  const [newPlatform, setNewPlatform] = useState("instagram");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [iconType, setIconType] = useState("react-icon"); // 'react-icon' | 'custom'
  const [customIconFile, setCustomIconFile] = useState(null);
  const [customIconUrl, setCustomIconUrl] = useState("");

  // Navigation Links
  const [tabs, setTabs] = useState([]);
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");

  // Category Links
  const [categories, setCategories] = useState([]);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [categoryHref, setCategoryHref] = useState("");

  // Dynamic Custom Pages
  const [pages, setPages] = useState([]);
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [hasCarousel, setHasCarousel] = useState(false);
  const [addToNavbar, setAddToNavbar] = useState(true);

  const standardLinks = [
    { label: "Shop", href: "/shop" },
    { label: "New Arrivals", href: "/newarrivals" },
    { label: "Brands", href: "/brands" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const standardCategories = [
    { label: "Kaftans", href: "/shop?category=kaftans" },
    { label: "Luxury Accessories", href: "/shop?category=accessories" },
    { label: "Tailored Shirts", href: "/shop?category=shirts" },
    { label: "Women's Wear", href: "/shop?category=women" },
    { label: "Men's Wear", href: "/shop?category=men" },
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

async function loadAdminData() {
  setLoading(true);

  // 1. Fetch store settings
  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (settings) {
    setLogoUrl(settings.logo_url || "");
    setFooterDescription(settings.footer_description || "");
    setContactAddress(settings.contact_address || "");
    setContactPhone(settings.contact_phone || "");
    setContactEmail(settings.contact_email || "");

    // Check developed_by columns first, then fall back to created_by columns
    setorderDevelopedByText(
      settings.created_by_text || ""
    );
    setorderDevelopedByLink(
      settings.created_by_link || ""
    );
    setorderDevelopedByPosition(
      settings.created_by_position || "right"
    );

    setCategories(settings.footer_categories || []);
  }

  // 2. Fetch social links
  const { data: socialData } = await supabase
    .from("social_links")
    .select("*")
    .order("order_index", { ascending: true });
  if (socialData) setSocials(socialData);

  // 3. Fetch custom pages
  const { data: pageData } = await supabase
    .from("custom_pages")
    .select("*")
    .order("created_at", { ascending: false });
  if (pageData) setPages(pageData);

  // 4. Fetch nav items
  const { data: tabData } = await supabase
    .from("navigation_tabs")
    .select("*")
    .order("order_index", { ascending: true });
  if (tabData) setTabs(tabData);

  setLoading(false);
}

async function handleFooterSave(e) {
  e.preventDefault();
  setSavingFooter(true);

  const { error } = await supabase
    .from("store_settings")
    .upsert({
      id: 1,
      footer_description: footerDescription,
      contact_address: contactAddress,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      created_by_text: orderDevelopedByText,
      created_by_link: orderDevelopedByLink,
      created_by_position: orderDevelopedByPosition,
      created_by_text: orderDevelopedByText,
      created_by_link: orderDevelopedByLink,
      created_by_position: orderDevelopedByPosition,
    });

  setSavingFooter(false);

  if (error) {
    console.error("Error saving footer settings:", error);
    alert(`Failed to save footer settings: ${error.message}`);
    return;
  }

  alert("Footer details and attribution saved successfully!");
}

  // Handle Logo Upload or URL update
  async function handleLogoUpload(e) {
    e.preventDefault();
    let finalLogoUrl = logoUrl;

    if (logoFile) {
      setUploadingLogo(true);
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `store-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        setUploadingLogo(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);
      finalLogoUrl = urlData.publicUrl;
      setLogoUrl(finalLogoUrl);
    }

    const { error: updateError } = await supabase
      .from("store_settings")
      .upsert({ id: 1, logo_url: finalLogoUrl });

    setUploadingLogo(false);

    if (updateError) {
      alert("Error saving logo: " + updateError.message);
    } else {
      alert("Logo updated successfully!");
      setLogoFile(null);
    }
  }

  // Save Categories to store_settings
  async function saveCategoriesToDb(updatedCategories) {
    const { error } = await supabase
      .from("store_settings")
      .upsert({ id: 1, footer_categories: updatedCategories });

    if (error) {
      alert("Error saving category: " + error.message);
    } else {
      setCategories(updatedCategories);
    }
  }

  // Add Category
  async function handleAddCategory(e) {
    e.preventDefault();
    if (!categoryLabel.trim() || !categoryHref.trim()) return;

    const newCategory = {
      id: Date.now(),
      label: categoryLabel.trim(),
      href: categoryHref.trim(),
    };

    const updated = [...categories, newCategory];
    await saveCategoriesToDb(updated);
    setCategoryLabel("");
    setCategoryHref("");
  }

  // Quick Add Standard Category
  async function handleQuickAddCategory(item) {
    const exists = categories.some((c) => c.href === item.href);
    if (exists) {
      alert(`The category ${item.label} is already added.`);
      return;
    }

    const updated = [...categories, { id: Date.now(), label: item.label, href: item.href }];
    await saveCategoriesToDb(updated);
  }

  // Delete Category
  async function handleDeleteCategory(id) {
    const updated = categories.filter((c) => c.id !== id);
    await saveCategoriesToDb(updated);
  }

  // Add Social Link
  async function handleAddSocial(e) {
    e.preventDefault();
    if (!newSocialUrl.trim()) return;

    setAddingSocial(true);
    let finalCustomIconUrl = customIconUrl.trim();

    if (iconType === "custom" && customIconFile) {
      const fileExt = customIconFile.name.split(".").pop();
      const fileName = `social-icon-${Date.now()}.${fileExt}`;
      const filePath = `social-icons/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("logos")
        .upload(filePath, customIconFile, { upsert: true });

      if (uploadErr) {
        alert("Error uploading custom icon: " + uploadErr.message);
        setAddingSocial(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);
      finalCustomIconUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("social_links").insert([
      {
        platform: newPlatform,
        url: newSocialUrl.trim(),
        icon_type: iconType,
        custom_icon_url: iconType === "custom" ? finalCustomIconUrl : null,
        order_index: socials.length + 1,
      },
    ]);

    setAddingSocial(false);

    if (error) {
      alert("Error adding social link: " + error.message);
    } else {
      setNewSocialUrl("");
      setCustomIconUrl("");
      setCustomIconFile(null);
      loadAdminData();
    }
  }

  // Delete Social Link
  async function handleDeleteSocial(id) {
    if (!confirm("Are you sure you want to remove this social link?")) return;
    await supabase.from("social_links").delete().eq("id", id);
    loadAdminData();
  }

  // Quick Add Standard Nav Link
  async function handleQuickAdd(link) {
    const exists = tabs.some((t) => t.href === link.href);
    if (exists) {
      alert(`The link ${link.href} is already on your navbar.`);
      return;
    }

    const { error } = await supabase.from("navigation_tabs").insert([
      {
        label: link.label,
        href: link.href,
        is_active: true,
        order_index: tabs.length + 1,
      },
    ]);

    if (error) {
      alert("Error adding link: " + error.message);
    } else {
      loadAdminData();
    }
  }

  // Add Custom Link Manually
  async function handleAddCustomLink(e) {
    e.preventDefault();
    if (!customLabel.trim() || !customHref.trim()) return;

    const { error } = await supabase.from("navigation_tabs").insert([
      {
        label: customLabel.trim(),
        href: customHref.trim(),
        is_active: true,
        order_index: tabs.length + 1,
      },
    ]);

    if (error) {
      alert("Error adding link: " + error.message);
    } else {
      setCustomLabel("");
      setCustomHref("");
      loadAdminData();
    }
  }

  // Delete Nav Tab
  async function handleDeleteTab(id) {
    await supabase.from("navigation_tabs").delete().eq("id", id);
    loadAdminData();
  }

  // Create Dynamic Page
  async function handleCreatePage(e) {
    e.preventDefault();
    setCreatingPage(true);

    const generatedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-");

    const targetHref = `/page/${generatedSlug}`;

    const { error: pageErr } = await supabase.from("custom_pages").insert([
      {
        title: pageTitle,
        slug: generatedSlug,
        hero_subtitle: heroSubtitle,
        body_text: bodyText,
        button_text: buttonText,
        button_link: buttonLink,
        has_carousel: hasCarousel,
      },
    ]);

    if (pageErr) {
      alert("Error creating page: " + pageErr.message);
      setCreatingPage(false);
      return;
    }

    if (addToNavbar) {
      await supabase.from("navigation_tabs").insert([
        {
          label: pageTitle,
          href: targetHref,
          is_active: true,
          order_index: tabs.length + 1,
        },
      ]);
    }

    setCreatingPage(false);
    alert("Dynamic Page created successfully!");
    setPageTitle("");
    setSlug("");
    setHeroSubtitle("");
    setBodyText("");
    setButtonText("");
    setButtonLink("");
    setHasCarousel(false);
    loadAdminData();
  }

  // Delete Dynamic Page
  async function handleDeletePage(id, pageSlug) {
    if (!confirm("Are you sure you want to delete this custom page?")) return;

    const { error } = await supabase.from("custom_pages").delete().eq("id", id);
    if (error) {
      alert("Error deleting page: " + error.message);
      return;
    }

    const targetHref = `/page/${pageSlug}`;
    await supabase.from("navigation_tabs").delete().eq("href", targetHref);

    loadAdminData();
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center text-gray-500 font-semibold">
        Loading site settings...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Site & Content Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Configure site branding, footer information, navigation, categories, and custom dynamic pages.</p>
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { id: "general", label: "Brand & Footer" },
          { id: "categories", label: "Footer Categories" },
          { id: "socials", label: "Social Links" },
          { id: "nav", label: "Navbar Links" },
          { id: "pages", label: "Custom Pages" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Brand & Footer */}
      {activeTab === "general" && (
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Store Logo</h2>
            <form onSubmit={handleLogoUpload} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {logoUrl && (
                  <div className="w-16 h-16 border rounded-xl p-2 flex items-center justify-center bg-gray-50">
                    <img src={logoUrl} alt="Store Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-xs font-bold text-gray-600">Upload Logo Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="flex-1 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {uploadingLogo ? "Uploading..." : "Save Logo"}
                </button>
              </div>
            </form>
          </div>

          {/* Footer & Contact Settings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Footer Text & Contact Information</h2>

            <form onSubmit={handleFooterSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Footer Description</label>
                <textarea
                  rows={3}
                  value={footerDescription}
                  onChange={(e) => setFooterDescription(e.target.value)}
                  placeholder="High-end apparel, tailored kaftans..."
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Store Address</label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="Accra, Ghana"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="0595805215"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="gladyscloset61@gmail.com"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3">"Developed By" Attribution Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Developed By Text</label>
                    <input
                      type="text"
                      value={orderDevelopedByText}
                      onChange={(e) => setorderDevelopedByText(e.target.value)}
                      placeholder="Designed by MyAgency"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Developed By Link (URL)</label>
                    <input
                      type="text"
                      value={orderDevelopedByLink}
                      onChange={(e) => setorderDevelopedByLink(e.target.value)}
                      placeholder="https://myagency.com"
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Footer Position</label>
                    <select
                      value={orderDevelopedByPosition}
                      onChange={(e) => setorderDevelopedByPosition(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="right">Bottom Right (Next to Links)</option>
                      <option value="center">Bottom Center (Above Copyright Bar)</option>
                      <option value="brand">Brand Column (Under Description)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
               <button
                  type="submit"
                  disabled={savingFooter}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {savingFooter ? "Saving..." : "Save Footer Details & Attribution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Footer Categories */}
      {activeTab === "categories" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Quick Add Standard Categories</h2>
            <p className="text-xs text-gray-500 mb-4">Click any item below to quickly populate your footer categories column.</p>
            <div className="flex flex-wrap gap-2">
              {standardCategories.map((cat) => {
                const isAdded = categories.some((c) => c.href === cat.href);
                return (
                  <button
                    key={cat.href}
                    type="button"
                    onClick={() => handleQuickAddCategory(cat)}
                    disabled={isAdded}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isAdded
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                    }`}
                  >
                    {isAdded ? "✓ Added" : `+ Add ${cat.label}`}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Add Custom Category Link</h3>
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                placeholder="Category Name (e.g. Footwear)"
                className="border rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={categoryHref}
                onChange={(e) => setCategoryHref(e.target.value)}
                placeholder="Link URL (e.g. /shop?category=footwear)"
                className="border rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition">
                Add Category
              </button>
            </form>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Active Footer Categories</h3>
            <div className="divide-y border rounded-xl overflow-hidden">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-800 text-sm">{cat.label}</span>
                    <span className="text-xs text-gray-400 ml-3">({cat.href})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  No categories added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dynamic Social Links */}
      {activeTab === "socials" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800">Manage Social Media Links & Icons</h2>
          
          <form onSubmit={handleAddSocial} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">X / Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="website">Custom Web Link</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Target URL or Phone Number</label>
                <input
                  type="text"
                  required
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="https://... or 233595805215"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Icon Style</label>
              <div className="flex gap-4 items-center mb-3">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="iconType"
                    value="react-icon"
                    checked={iconType === "react-icon"}
                    onChange={() => setIconType("react-icon")}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  Use Built-in Icon
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="iconType"
                    value="custom"
                    checked={iconType === "custom"}
                    onChange={() => setIconType("custom")}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  Upload Custom Icon Image
                </label>
              </div>

              {iconType === "custom" && (
                <div className="space-y-2 p-3 bg-white border rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Upload Icon Image File (SVG or PNG)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCustomIconFile(e.target.files[0] || null)}
                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Or Paste Custom Icon Image URL</label>
                    <input
                      type="text"
                      value={customIconUrl}
                      onChange={(e) => setCustomIconUrl(e.target.value)}
                      placeholder="https://.../icon.png"
                      className="w-full border rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={addingSocial}
              className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {addingSocial ? "Saving..." : "Add Social Link"}
            </button>
          </form>

          <div className="divide-y border rounded-xl overflow-hidden">
            {socials.map((soc) => (
              <div key={soc.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {soc.icon_type === "custom" && soc.custom_icon_url ? (
                    <img src={soc.custom_icon_url} alt={soc.platform} className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                      Built-in Icon
                    </span>
                  )}
                  <div>
                    <span className="font-bold text-gray-800 text-sm capitalize">{soc.platform}</span>
                    <span className="text-xs text-gray-400 ml-3 truncate inline-block max-w-xs">{soc.url}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSocial(soc.id)}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
            {socials.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400">
                No social links added yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Direct Navbar Link Manager */}
      {activeTab === "nav" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Quick Add Standard Routes</h2>
            <p className="text-xs text-gray-500 mb-4">Click any item below to immediately append default store paths to your navigation bar.</p>
            <div className="flex flex-wrap gap-2">
              {standardLinks.map((link) => {
                const isAdded = tabs.some((t) => t.href === link.href);
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => handleQuickAdd(link)}
                    disabled={isAdded}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isAdded
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                    }`}
                  >
                    {isAdded ? "✓ Added" : `+ Add ${link.label}`}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Add Custom Route to Navbar</h3>
            <form onSubmit={handleAddCustomLink} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Label (e.g. Clearance)"
                className="border rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={customHref}
                onChange={(e) => setCustomHref(e.target.value)}
                placeholder="Path (e.g. /shop?sale=true)"
                className="border rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition">
                Add Link
              </button>
            </form>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Active Navbar Links</h3>
            <div className="divide-y border rounded-xl overflow-hidden">
              {tabs.map((tab) => (
                <div key={tab.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-800 text-sm">{tab.label}</span>
                    <span className="text-xs text-gray-400 ml-3">({tab.href})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTab(tab.id)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Delete Link
                  </button>
                </div>
              ))}
              {tabs.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  No custom links added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Dynamic Page Builder & List */}
      {activeTab === "pages" && (
        <div className="space-y-8">
          {/* Create Page Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Create Dynamic Page</h2>
            <form onSubmit={handleCreatePage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value);
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9 -]/g, "")
                        .replace(/\s+/g, "-")
                    );
                  }}
                  placeholder="e.g. Summer Clearance"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="summer-clearance"
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Discover the hottest discounts of the season"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Page Body Content</label>
                <textarea
                  rows={5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Write your page copy here..."
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Button Call to Action (Text)</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Shop Deals"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Button Link</label>
                <input
                  type="text"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="/shop?category=sale"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2 space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableCarousel"
                    checked={hasCarousel}
                    onChange={(e) => setHasCarousel(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="enableCarousel" className="text-sm font-semibold text-gray-700">
                    Enable Carousel Banner on this page
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addToNav"
                    checked={addToNavbar}
                    onChange={(e) => setAddToNavbar(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="addToNav" className="text-sm font-semibold text-gray-700">
                    Automatically add a corresponding link tab to the Navbar
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={creatingPage}
                  className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {creatingPage ? "Publishing..." : "Publish Page"}
                </button>
              </div>
            </form>
          </div>

          {/* Published Custom Pages List */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Existing Custom Pages</h2>
            <div className="divide-y border rounded-xl overflow-hidden">
              {pages.map((page) => (
                <div key={page.id} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{page.title}</h3>
                    <p className="text-xs text-gray-400">Route: /page/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`/page/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-purple-600 font-bold hover:underline"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeletePage(page.id, page.slug)}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {pages.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  No custom pages published yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}