import { supabase } from "./supabase";

const TABLE = "products";
const BUCKET = "product-images";

/**
 * Everything the rest of the app knows about products goes through this file.
 * If Gladys' Closet ever migrates off Supabase, only this file needs to change.
 */

export async function listProducts({ search = "" } = {}) {
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProduct(id) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase.from(TABLE).insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase.from(TABLE).update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

/**
 * Uploads an image file to Supabase Storage and returns its public URL.
 * Call this once per image, then save the returned URLs onto the product's image_urls array.
 */
export async function uploadProductImage(file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
