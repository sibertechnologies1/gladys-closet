import { supabase } from "./supabase";

const TABLE = "orders";

export async function listOrders({ status = "all" } = {}) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}

export async function getOrder(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("status, total_pesewas");

  if (error) throw error;

  const stats = {
    totalOrders: data.length,

    totalSalesPesewas: data
      .filter((o) => o.status !== "cancelled")
      .reduce(
        (sum, o) => sum + (o.total_pesewas || 0),
        0
      ),

    pendingCount: data.filter(
      (o) => o.status === "pending"
    ).length,
  };

  return stats;
}

/*
  Get sales for the last 6 months.
*/
export async function getMonthlySales() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("created_at, total_pesewas, status")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();

    date.setMonth(date.getMonth() - i);

    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),

      label: date.toLocaleDateString("en-US", {
        month: "short",
      }),

      salesPesewas: 0,
    });
  }

  data.forEach((order) => {
    // Cancelled orders do not count as sales
    if (order.status === "cancelled") return;

    const orderDate = new Date(order.created_at);

    const matchingMonth = months.find(
      (item) =>
        item.year === orderDate.getFullYear() &&
        item.month === orderDate.getMonth()
    );

    if (matchingMonth) {
      matchingMonth.salesPesewas +=
        order.total_pesewas || 0;
    }
  });

  return months.map((item) => ({
    month: item.label,
    sales: item.salesPesewas / 100,
  }));
}

/*
  Get total orders for the last 6 months.
*/
export async function getMonthlyOrders() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();

    date.setMonth(date.getMonth() - i);

    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),

      label: date.toLocaleDateString("en-US", {
        month: "short",
      }),

      orders: 0,
    });
  }

  data.forEach((order) => {
    const orderDate = new Date(order.created_at);

    const matchingMonth = months.find(
      (item) =>
        item.year === orderDate.getFullYear() &&
        item.month === orderDate.getMonth()
    );

    if (matchingMonth) {
      matchingMonth.orders += 1;
    }
  });

  return months.map((item) => ({
    month: item.label,
    orders: item.orders,
  }));
}

/*
  Get pending orders for the last 6 months.

  This counts orders whose current status is "pending"
  and whose created_at date falls within each month.
*/
export async function getMonthlyPendingOrders() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("created_at, status")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();

    date.setMonth(date.getMonth() - i);

    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),

      label: date.toLocaleDateString("en-US", {
        month: "short",
      }),

      pending: 0,
    });
  }

  data.forEach((order) => {
    if (order.status !== "pending") return;

    const orderDate = new Date(order.created_at);

    const matchingMonth = months.find(
      (item) =>
        item.year === orderDate.getFullYear() &&
        item.month === orderDate.getMonth()
    );

    if (matchingMonth) {
      matchingMonth.pending += 1;
    }
  });

  return months.map((item) => ({
    month: item.label,
    pending: item.pending,
  }));
}

/*
  Create a new order and decrement stock for each purchased product.
*/
export async function createOrder(orderDetails, cartItems) {
  // 1. Insert order details into the orders table
  const { data: order, error: orderError } = await supabase
    .from(TABLE)
    .insert([orderDetails])
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Loop through cart items and reduce stock count for each product
  for (const item of cartItems) {
    const newStock = (item.stock || 0) - item.quantity;

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock < 0 ? 0 : newStock })
      .eq("id", item.id);

    if (updateError) {
      console.error(
        `Failed to update stock for product ${item.id}:`,
        updateError
      );
    }
  }

  return order;
}