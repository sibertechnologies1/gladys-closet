import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");

serve(async (req) => {
  // CORS Headers for browser requests
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Upload temporary image
    const fileName = `search-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("temp-search-images")
      .upload(fileName, image, { contentType: image.type, upsert: true });

    if (uploadError) {
      console.error("Bucket Upload Error:", uploadError.message);
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from("temp-search-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // 3. Call SerpApi Google Lens
    const lensRes = await fetch(
      `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(imageUrl)}&api_key=${SERPAPI_KEY}`
    );
    const lensData = await lensRes.json();

    const visualMatches = lensData.visual_matches || [];
    const titles = visualMatches.map((item: any) => item.title).filter(Boolean);

    if (titles.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Extract words & search database
    const rawString = titles.slice(0, 3).join(" ");
    const cleanWords = [...new Set(
      rawString
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(/\s+/)
        .filter((word: string) => word.length >= 4)
    )];

    if (cleanWords.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orConditions = cleanWords.map((word: string) => `name.ilike.%${word}%`).join(",");

    const { data: products } = await supabase
      .from("products")
      .select("id, name, price_pesewas, image_urls")
      .or(orConditions)
      .limit(6);

    return new Response(JSON.stringify({ results: products || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});