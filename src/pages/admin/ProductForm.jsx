import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, createProduct, updateProduct, uploadProductImage } from "../../lib/products";
import { cedisToPesewas, pesewasToCedisInput } from "../../lib/format";
import { supabase } from "../../lib/supabase";
import { FiPlus, FiTrash2, FiUpload } from "react-icons/fi";

const CATEGORIES = [
  "Dresses", "Tops", "Skirts", "Traditional", "Bottoms", "Accessories", 
  "Sneakers", "Sandals", "Heels", "Flats", "Bags", "Jewelry", 
  "Watches", "Hats", "Scarves", "Sunglasses", "Belts", "Outerwear", 
  "Swimwear", "Lingerie", "Sleepwear", "Activewear", "Maternity", 
  "Kidswear", "Shoes"
];

const AUDIENCES = ["women", "men", "kids", "sports"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Dresses",
  audience: "women",
  is_preorder: false,
  image_urls: [],
};

const emptyVariant = {
  color: "",
  size: "",
  stock_quantity: 0,
  image_urls: [],
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = id && id !== "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [variants, setVariants] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    async function loadData() {
      try {
        const product = await getProduct(id);
        setForm({
          name: product.name || "",
          description: product.description || "",
          price: pesewasToCedisInput(product.price_pesewas),
          category: product.category || "Dresses",
          audience: product.audience || "women",
          is_preorder: product.is_preorder ?? false,
          image_urls: product.image_urls || [],
        });

        const { data: variantData } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", id);

        if (variantData && variantData.length > 0) {
          const formattedVariants = variantData.map((v) => ({
            id: v.id,
            color: v.color_name || "",
            size: v.size || "",
            stock_quantity: v.stock_quantity || 0,
            color_hex: v.color_hex || "",
            image_urls: v.color_image_url ? [v.color_image_url] : [],
          }));
          setVariants(formattedVariants);
        }
      } catch (err) {
        setError("Failed to load product details.");
      }
    }
    loadData();
  }, [id, isEditing]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, { ...emptyVariant }]);
  }

  function removeVariantRow(index) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariantField(index, field, value) {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleMainImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadProductImage));
      setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ...urls] }));
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleVariantImageUpload(index, e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadProductImage));
      setVariants((prev) => {
        const updated = [...prev];
        const currentUrls = updated[index].image_urls || [];
        updated[index].image_urls = [...currentUrls, ...urls];
        return updated;
      });
    } catch {
      setError("Variant image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const rawPrice = parseFloat(form.price) || 0;
    const computedStock = variants.length > 0
      ? variants.reduce((acc, v) => acc + (parseInt(v.stock_quantity, 10) || 0), 0)
      : 0;

    const extractedSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
    const extractedColors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description.trim(),
      price_pesewas: cedisToPesewas(rawPrice),
      category: form.category,
      audience: form.audience,
      sizes: extractedSizes,
      colors: extractedColors,
      stock: computedStock,
      is_preorder: form.is_preorder,
      image_urls: form.image_urls,
    };

    try {
      let productId = id;
      if (isEditing) {
        await updateProduct(id, payload);
      } else {
        payload.initial_stock = computedStock;
        const newProd = await createProduct(payload);
        productId = newProd.id;
      }

      if (productId) {
        await supabase.from("product_variants").delete().eq("product_id", productId);

        let insertedVariants = [];
        if (variants.length > 0) {
          const variantPayloads = variants.map((v) => ({
            product_id: productId,
            color_name: v.color || null,
            size: v.size || null,
            color_hex: v.color_hex || "",
            stock_quantity: parseInt(v.stock_quantity, 10) || 0,
            color_image_url: v.image_urls?.[0] || null,
          }));

          const { data, error: variantError } = await supabase
            .from("product_variants")
            .insert(variantPayloads)
            .select();

          if (variantError) throw variantError;
          insertedVariants = data || [];
        }

        await supabase.from("product_images").delete().eq("product_id", productId);

        const imagePayload = [];

        form.image_urls.forEach((url, idx) => {
          imagePayload.push({
            product_id: productId,
            variant_id: null,
            image_url: url,
            is_primary: idx === 0,
          });
        });

        insertedVariants.forEach((variant) => {
          if (variant.color_image_url) {
            imagePayload.push({
              product_id: productId,
              variant_id: variant.id,
              image_url: variant.color_image_url,
              is_primary: false,
            });
          }
        });

        if (imagePayload.length > 0) {
          const { error: imgErr } = await supabase
            .from("product_images")
            .insert(imagePayload);

          if (imgErr) throw imgErr;
        }
      }

      navigate("/admindashboard/products");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Couldn't save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mx-auto">
      <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
        {isEditing ? "Edit Product" : "Add Product"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none transition"
            />
          </Field>
          <Field label="Price (GHS)">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none transition"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none transition"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-purple-600 outline-none transition"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Audience">
            <select
              value={form.audience}
              onChange={(e) => updateField("audience", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-purple-600 outline-none transition"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-purple-50/70 border border-purple-100">
          <input
            type="checkbox"
            id="is_preorder"
            checked={form.is_preorder}
            onChange={(e) => updateField("is_preorder", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
          />
          <label htmlFor="is_preorder" className="text-sm font-bold text-purple-900 cursor-pointer select-none">
            Mark as Pre-Order Product
          </label>
        </div>

        <Field label="Main Showcase Images">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleMainImageUpload}
            className="block w-full text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
          />
          <div className="mt-3 flex flex-wrap gap-2.5">
            {form.image_urls.map((url) => (
              <div key={url} className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                <img src={url} alt="Main preview" className="w-full h-full rounded-lg object-cover border" />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, image_urls: p.image_urls.filter((u) => u !== url) }))}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </Field>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Product Variants</h2>
            <button
              type="button"
              onClick={addVariantRow}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-xl transition w-full sm:w-auto"
            >
              <FiPlus /> Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, idx) => (
              <div key={idx} className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <input
                    placeholder="Color (e.g. Red)"
                    value={v.color}
                    onChange={(e) => updateVariantField(idx, "color", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-purple-500"
                  />
                  <input
                    placeholder="Size (e.g. XL)"
                    value={v.size}
                    onChange={(e) => updateVariantField(idx, "size", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-purple-500"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock Quantity"
                    value={v.stock_quantity}
                    onChange={(e) => updateVariantField(idx, "stock_quantity", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100/70 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition">
                      <FiUpload /> Upload Variant Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleVariantImageUpload(idx, e)}
                      />
                    </label>
                    <span className="text-xs text-gray-400">({v.image_urls?.length || 0})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariantRow(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 ml-auto sm:ml-0"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>

                {v.image_urls && v.image_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {v.image_urls.map((img) => (
                      <img key={img} src={img} alt="Variant preview" className="w-10 h-10 rounded-md object-cover border" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admindashboard/products")}
            className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50 text-center"
          >
            {saving ? "Saving..." : "Save Product & Variants"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}