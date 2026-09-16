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
        .select("*")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setProducts(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Couldn't load products. Please check your network or database connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleDelete(product) {
    const confirmed = window.confirm(`Remove "${product.name || "this item"}" from your inventory?`);
    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product. Please try again.");
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store inventory, pre-orders, and pricing.</p>
        </div>

        <Link
          to="/admindashboard/products/new"
          className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          + Add Product
        </Link>
      </div>

      {/* Search Input */}
      <div className="mt-6">
        <input
          type="search"
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 text-sm bg-white shadow-sm"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Total Stock</th>
              <th className="px-6 py-4">Stock Left</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Loading catalog items...
                </td>
              </tr>
            )}

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}

            {!loading &&
              products.map((product) => {
                const imageUrl = Array.isArray(product.image_urls) && product.image_urls.length > 0
                  ? product.image_urls[0]
                  : product.image_url || null;

                const priceGHS = product.price_pesewas
                  ? (product.price_pesewas / 100).toFixed(2)
                  : product.price
                  ? Number(product.price).toFixed(2)
                  : "0.00";

                const totalStock = product.initial_stock ?? product.stock ?? 0;
                const stockLeft = product.stock ?? 0;
                const isPreorder = Boolean(product.is_preorder);

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Image & Name */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No img
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">
                        {product.name || "Unnamed Product"}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 capitalize text-gray-500">
                      {product.category || "General"}
                    </td>

                    {/* Type Tag */}
                    <td className="px-6 py-4">
                      {isPreorder ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                          Pre-Order
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Standard
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      GH₵ {priceGHS}
                    </td>

                    {/* Total Stock */}
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {totalStock}
                    </td>

                    {/* Stock Left */}
                    <td className="px-6 py-4">
                      {stockLeft === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Out of stock (0)
                        </span>
                      ) : (
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                          {stockLeft}
                        </span>
                      )}
                    </td>

                    {/* Action Links */}
                    <td className="px-6 py-4 text-right space-x-3 flex items-center justify-end">
                      <Link
                        to={`/admindashboard/products/${product.id}`}
                        className="text-purple-600 hover:text-purple-800 font-semibold text-xs"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs"
                      >
                        Delete
                      </button>
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