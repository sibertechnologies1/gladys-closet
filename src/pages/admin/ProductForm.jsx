import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, createProduct, updateProduct, uploadProductImage } from "../../lib/products";
import { cedisToPesewas, pesewasToCedisInput } from "../../lib/format";

const CATEGORIES = ["Dresses", "Tops", "Skirts", "Traditional", "Bottoms", "Accessories"];
const AUDIENCES = ["women", "men", "kids", "sports"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Dresses",
  audience: "women",
  sizes: "",
  colors: "",
  stock: "",
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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    getProduct(id).then((product) => {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: pesewasToCedisInput(product.price_pesewas),
        category: product.category || "Dresses",
        audience: product.audience || "women",
        sizes: (product.sizes || []).join(", "),
        colors: (product.colors || []).join(", "),
        stock: product.stock ?? "",
        image_urls: product.image_urls || [],
      });
    });
  }, [id, isEditing]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      const urls = await Promise.all(files.map(uploadProductImage));
      setForm((prev) => ({ ...prev, image_urls: urls }));
    } catch (err) {
      setError("Image upload failed. Check that the 'product-images' storage bucket exists and is public.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    setForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((u) => u !== url),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const rawPrice = parseFloat(form.price) || 0;
    const rawStock = parseInt(form.stock, 10) || 0;

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description.trim(),
      price_pesewas: cedisToPesewas(rawPrice),
      category: form.category,
      audience: form.audience,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
      stock: rawStock,
      image_urls: form.image_urls,
    };

    try {
      if (isEditing) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Database save failed:", err);
      setError(err?.message || err?.details || "Couldn't save this product. Double-check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">
        {isEditing ? "Edit Product" : "Add Product"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (GHS)">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </Field>
          <Field label="Stock">
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Audience">
            <select
              value={form.audience}
              onChange={(e) => updateField("audience", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sizes (comma-separated)">
            <input
              placeholder="S, M, L, XL"
              value={form.sizes}
              onChange={(e) => updateField("sizes", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </Field>
          <Field label="Colors (comma-separated)">
            <input
              placeholder="Black, Cream, Rust"
              value={form.colors}
              onChange={(e) => updateField("colors", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </Field>
        </div>

        <Field label="Images">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
          />
          {uploading && <p className="mt-1 text-xs text-gray-500">Uploading new image...</p>}
          
          {form.image_urls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {form.image_urls.map((url) => (
                <div key={url} className="relative group w-20 h-20">
                  <img src={url} alt="Product preview" className="w-full h-full rounded-xl object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md hover:bg-red-700 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        {error && (
          <p className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
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