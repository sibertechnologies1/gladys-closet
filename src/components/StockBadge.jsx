import { useProductStock } from '../hooks/useProductStock';

export default function StockBadge({ productId, initialStock, threshold = 5 }) {
  const currentStock = useProductStock(productId, initialStock);

  if (currentStock === 0) {
    return (
      <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
        Out of Stock
      </span>
    );
  }

  if (currentStock <= threshold) {
    return (
      <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
        🔥 Only {currentStock} left in stock!
      </span>
    );
  }

  return null;
}