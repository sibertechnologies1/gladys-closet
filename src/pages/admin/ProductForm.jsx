import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, createProduct, updateProduct, uploadProductImage } from "../../lib/products";
import { cedisToPesewas, pesewasToCedisInput } from "../../lib/format";

const CATEGORIES = ["tops", "bottoms", "footwear", "perfumes", "jewelry", "other"];
const AUDIENCES = ["men", "women", "boys", "girls"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "tops",
  audience: "women",
  sizes: "",
  colors: "",
  stock: "",
  image_urls: [],
};

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
        category: product.category || "tops",
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
    try {
      const urls = await Promise.all(files.map(uploadProductImage));
      setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ...urls] }));
    } catch (err) {
      setError("Image upload failed. Check that the 'product-images' storage bucket exists and is public.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    setForm((prev) => ({ ...prev, image_urls: prev.image_urls.filter((u) => u !== url) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price_pesewas: cedisToPesewas(form.price),
      category: form.category,
      audience: form.audience,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      stock: parseInt(form.stock, 10) || 0,
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
      setError("Couldn't save this product. Double-check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-medium text-ink">
        {isEditing ? "Edit product" : "Add product"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="input"
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
              className="input"
            />
          </Field>
          <Field label="Stock">
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="input"
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
              className="input"
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
              className="input"
            />
          </Field>
          <Field label="Colors (comma-separated)">
            <input
              placeholder="Black, Cream, Rust"
              value={form.colors}
              onChange={(e) => updateField("colors", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Images">
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          {uploading && <p className="mt-1 text-xs text-muted">Uploading…</p>}
          {form.image_urls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {form.image_urls.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -right-2 -top-2 rounded-full bg-ink px-1.5 py-0.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        {error && <p className="text-sm text-coral-dark">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-md bg-plum px-5 py-2 text-sm font-medium text-white hover:bg-plum-light disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-md border border-line px-5 py-2 text-sm font-medium text-ink hover:bg-canvas"
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
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
