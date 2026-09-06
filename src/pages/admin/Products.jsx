import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts, deleteProduct } from "../../lib/products";
import { formatGHS } from "../../lib/format";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await listProducts({ search });
      setProducts(data);
      setError("");
    } catch (err) {
      setError("Couldn't load products. Check your Supabase connection and table setup.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(product) {
    const confirmed = window.confirm(`Remove "${product.name}" from the store?`);
    if (!confirmed) return;
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      window.alert("Couldn't delete that product. Try again.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted">Add, edit, and manage what's for sale.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-md bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark"
        >
          Add product
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search products by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full max-w-sm rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-plum"
      />

      {error && <p className="mt-4 text-sm text-coral-dark">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  Loading products…
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No products yet. Click "Add product" to create the first one.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-t border-line">
                <td className="flex items-center gap-3 px-4 py-3">
                  {product.image_urls?.[0] ? (
                    <img
                      src={product.image_urls[0]}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-canvas" />
                  )}
                  <span className="font-medium text-ink">{product.name}</span>
                </td>
                <td className="px-4 py-3 capitalize text-muted">{product.category}</td>
                <td className="px-4 py-3">{formatGHS(product.price_pesewas)}</td>
                <td className="px-4 py-3">
                  {product.stock === 0 ? (
                    <span className="text-coral-dark">Out of stock</span>
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="mr-4 text-sm font-medium text-plum hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-sm font-medium text-coral-dark hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
