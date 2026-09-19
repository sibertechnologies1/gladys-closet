import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProducts() {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_variants (
            id,
            color_name,
            color_hex,
            stock_quantity
          )
        `)
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      const { data, fetchError } = await query;
      if (fetchError) throw fetchError;
      setProducts(data || []);
      setError("");
    } catch (err) {
      setError("Couldn't load products catalog.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      await supabase.from("product_variants").delete().eq("product_id", product.id);
      const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);
      if (deleteError) throw deleteError;
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      alert("Failed to delete product.");
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage store items, variant inventories, and pricing.</p>
        </div>
        <Link
          to="/admindashboard/products/new"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-6">
        <input
          type="search"
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 text-sm bg-white shadow-sm"
        />
      </div>

      {error && <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Variants</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock Left</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading catalog...</td></tr>
            )}

            {!loading && products.map((product) => {
              const imageUrl = product.image_urls?.[0] || product.image_url;
              const priceGHS = product.price_pesewas ? (product.price_pesewas / 100).toFixed(2) : "0.00";
              const variants = product.product_variants || [];
              const stockLeft = variants.length > 0
                ? variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0)
                : (product.stock ?? 0);

              return (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover border" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">No img</div>
                    )}
                    <span className="font-semibold text-gray-900">{product.name}</span>
                  </td>

                  <td className="px-6 py-4 capitalize text-gray-500">{product.category || "General"}</td>

                  <td className="px-6 py-4 text-xs font-semibold text-purple-700">
                    {variants.length > 0 ? `${variants.length} variant(s)` : 'Single Item'}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900">GH₵ {priceGHS}</td>

                  <td className="px-6 py-4">
                    {stockLeft === 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Out of stock</span>
                    ) : (
                      <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">{stockLeft}</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right space-x-3">
                    <Link to={`/admindashboard/products/${product.id}`} className="text-purple-600 font-semibold text-xs hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(product)} className="text-red-500 font-semibold text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}