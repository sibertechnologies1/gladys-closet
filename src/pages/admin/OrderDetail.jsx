import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../../lib/orders";
import { formatGHS } from "../../lib/format";
import StatusBadge from "../../components/StatusBadge";
import { supabase } from "../../lib/supabase";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrder(id)
      .then(async (data) => {
        setOrder(data);

        // Fetch product prices if missing from order items JSON
        if (data?.items && data.items.length > 0) {
          const productIds = data.items.map((item) => item.id || item.product_id).filter(Boolean);

          let productMap = new Map();
          if (productIds.length > 0) {
            const { data: productsData } = await supabase
              .from("products")
              .select("id, price")
              .in("id", productIds);

            if (productsData) {
              productMap = new Map(productsData.map((p) => [p.id, p.price]));
            }
          }

          const itemsWithPrices = data.items.map((item) => {
            const itemId = item.id || item.product_id;
            const fetchedPrice = productMap.get(itemId);
            
            // Resolve unit price directly in Cedi values
            const unitPrice = fetchedPrice ?? item.price ?? item.unit_price ?? item.price_pesewas ?? 0;

            return {
              ...item,
              resolvedPrice: Number(unitPrice),
              resolvedQty: Number(item.qty || item.quantity || 1),
            };
          });

          setEnrichedItems(itemsWithPrices);
        }
      })
      .catch(() => setError("Couldn't load this order."));
  }, [id]);

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrder(updated);

      // Trigger status update email notification via Edge Function
      await supabase.functions.invoke("send-order-status-email", {
        body: {
          customerEmail: updated.customer_email,
          customerName: updated.customer_name,
          orderId: updated.id,
          newStatus: status,
        },
      });
    } catch (err) {
      setError("Couldn't update the status. Try again.");
    } finally {
      setUpdating(false);
    }
  }

  if (error) return <p className="text-sm text-coral-dark">{error}</p>;
  if (!order) return <p className="text-sm text-muted">Loading order…</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/admindashboard/orders" className="text-sm font-medium text-plum hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">Order details</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Customer</h2>
        <p className="mt-2 text-sm text-ink">{order.customer_name}</p>
        <p className="text-sm text-muted">{order.customer_phone}</p>
        <p className="text-sm text-muted">{order.customer_email}</p>
        <p className="mt-2 text-sm text-ink">{order.delivery_address}</p>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Items</h2>
        <ul className="mt-2 divide-y divide-line">
          {enrichedItems.map((item, i) => (
            <li key={i} className="flex justify-between py-2 text-sm">
              <span>
                {item.name || item.title} {item.size ? `— ${item.size}` : ""} {item.color ? `/ ${item.color}` : ""} ×{" "}
                {item.resolvedQty}
              </span>
              <span>{formatGHS(item.resolvedPrice * item.resolvedQty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-semibold">
          <span>Total</span>
          <span>{formatGHS(order.total_pesewas)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Payment</h2>
        <p className="mt-2 text-sm text-ink">
          Paystack reference: {order.paystack_reference || "Not yet verified"}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Update status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              disabled={updating}
              onClick={() => handleStatusChange(status)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors disabled:opacity-60 ${
                order.status === status
                  ? "bg-plum text-purple-600 font-bold"
                  : "bg-canvas text-muted hover:bg-line"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}