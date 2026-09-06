import { supabase } from "./supabaseClient";

const TABLE = "orders";

export async function listOrders({ status = "all" } = {}) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getOrder(id) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase.from(TABLE).update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getDashboardStats() {
  const { data, error } = await supabase.from(TABLE).select("status, total_pesewas");
  if (error) throw error;

  const stats = {
    totalOrders: data.length,
    totalSalesPesewas: data
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total_pesewas || 0), 0),
    pendingCount: data.filter((o) => o.status === "pending").length,
  };
  return stats;
}
