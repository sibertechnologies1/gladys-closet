import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useProductStock(productId, initialStock) {
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    setStock(initialStock);

    // Subscribe to updates on the specific product
    const channel = supabase
      .channel(`product-stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new.stock_quantity === 'number') {
            setStock(payload.new.stock_quantity);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, initialStock]);

  return stock;
}