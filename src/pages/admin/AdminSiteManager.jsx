import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminSiteManager() {
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [pages, setPages] = useState([]);
  const [tabs, setTabs] = useState([]);

  // Form states for custom pages
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [hasCarousel, setHasCarousel] = useState(false);
  const [addToNavbar, setAddToNavbar] = useState(true);

  // Form states for manual navbar link creation
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");

  const standardLinks = [
    { label: "Shop", href: "/shop" },
    { label: "New Arrivals", href: "/newarrivals" },
    { label: "Brands", href: "/brands" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    // 1. Fetch settings
    const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();
    if (settings) setLogoUrl(settings.logo_url || "");

    // 2. Fetch custom pages
    const { data: pageData } = await supabase.from("custom_pages").select("*").order("created_at", { ascending: false });
    if (pageData) setPages(pageData);

    // 3. Fetch nav items
    const { data: tabData } = await supabase.from("navigation_tabs").select("*").order("order_index", { ascending: true });
    if (tabData) setTabs(tabData);
  }

  // Handle Logo Upload from Local Computer
  async function handleLogoUpload(e) {
    e.preventDefault();
    let finalLogoUrl = logoUrl;

    if (logoFile) {
      setUploadingLogo(true);
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `store-assets/${fileName}`;

      // Upload file to Supabase storage bucket named "logos"
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        setUploadingLogo(false);
        return;
      }

      // Get public URL of uploaded image
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(filePath);
      finalLogoUrl = urlData.publicUrl;
      setLogoUrl(finalLogoUrl);
    }

    const { error: updateError } = await supabase
      .from("store_settings")
      .update({ logo_url: finalLogoUrl })
      .eq("id", 1);

    setUploadingLogo(false);

    if (updateError) {
      alert("Error saving settings: " + updateError.message);
    } else {
      alert("Logo updated successfully!");
      setLogoFile(null);
    }
  }

  // Quick Add Standard Link
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

  // Handle Dynamic Page and Navbar Creation
  async function handleCreatePage(e) {
    e.preventDefault();
    const generatedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const targetHref = `/page/${generatedSlug}`;

    // 1. Create Custom Page
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
      return;
    }

    // 2. Link to Navbar if toggle is checked
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

  // Delete Nav Tab
  async function handleDeleteTab(id) {
    await supabase.from("navigation_tabs").delete().eq("id", id);
    loadAdminData();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Admin Navbar & Content Manager</h1>

      {/* SECTION 1: Update Store Logo */}
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
              <label className="block text-xs font-bold text-gray-600">Upload Logo Image from Computer</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
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

      {/* SECTION 2: Direct Navbar Link Manager */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Quick Add Standard Navigation Links</h2>
          <p className="text-xs text-gray-500 mb-4">Click any item below to immediately add standard storefront routes to your navbar.</p>
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

        {/* Custom Path Form */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Add Custom Path to Navbar</h3>
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

        {/* Navbar Items List */}
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
                  onClick={() => handleDeleteTab(tab.id)}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Delete Link
                </button>
              </div>
            ))}
            {tabs.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400">
                No custom links added yet. Use the buttons above to populate your navbar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Create Dynamic Page */}
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
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
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

          {/* Page Options */}
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
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition">
              Publish Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}