import { supabase } from './supabase';

// Fetch all site content as a simple key-value object
export async function getSiteContent() {
  const { data, error } = await supabase.from('site_content').select('*');
  if (error) throw error;

  // Convert array of [{ key, value }] into { hero_title: '...', hero_subtitle: '...' }
  return data.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
}

// Update a single key-value entry
export async function updateContentKey(key, value) {
  const { data, error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date() })
    .select();

  if (error) throw error;
  return data;
}

// Upload dynamic assets to Supabase Storage and return the public URL
export async function uploadSiteImage(file) {
  const fileName = `banners/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('site-assets')
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('site-assets')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}