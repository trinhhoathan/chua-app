const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function loadEnv(path) {
  const env = {};
  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv(".env.local");
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing URL or key");
  process.exit(1);
}
console.log("url", url);
console.log("keyRole", env.SUPABASE_SERVICE_ROLE_KEY ? "service" : "anon");

const j = JSON.parse(fs.readFileSync("cms-bac-hong-rich.json", "utf8"));
const tid = "a146d06d-8a26-45e4-863d-c90cb26c9ecd";
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  const { data, error } = await supabase
    .from("temples")
    .update({
      reviews: j.reviews,
      gallery: j.gallery,
      google_rating: j.google_rating,
      google_review_count: j.google_review_count,
      maps_url: j.maps_url,
      maps_embed_url: j.maps_embed_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tid)
    .select(
      "id,name,google_rating,google_review_count,reviews,gallery,hero_image_url"
    )
    .single();

  if (error) {
    console.error("UPDATE error", error);
    process.exit(1);
  }
  console.log("ok", {
    name: data.name,
    rating: data.google_rating,
    count: data.google_review_count,
    reviews: Array.isArray(data.reviews) ? data.reviews.length : null,
    gallery: Array.isArray(data.gallery) ? data.gallery.length : null,
    hero: data.hero_image_url,
  });
})();
