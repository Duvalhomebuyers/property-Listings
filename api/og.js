module.exports = async function handler(req, res) {
  const slug = req.query.p;
  let title = "Wholesale Realty | Investment Property";
  let description = "View this investment property opportunity from Wholesale Realty, LLC";
  let image = "https://static.wixstatic.com/media/f6a0b0_5a6ee2bcabd8487d91d5db349b37cf99~mv2.png/v1/fill/w_582,h_225,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Modernized%20Wholesale%20Logo%20(3).png";

  if (slug) {
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      const response = await fetch(
        `${supabaseUrl}/rest/v1/properties?slug=eq.${slug}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const rows = await response.json();
      if (rows.length > 0) {
        const data = rows[0].data;
        title = data.address || title;
        description = data.askingPrice
          ? `${data.askingPrice} | ${data.shortDescription || "Investment Property"}`
          : data.shortDescription || description;
        if (data.heroImageUrl) image = data.heroImageUrl;
      }
    } catch (e) {
      // If fetch fails, fall through with default meta tags
    }
  }

  // Escape HTML entities to prevent injection
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Redirect URL — adds &r=1 so the rewrite doesn't loop back here
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const redirectUrl = `${protocol}://${host}/?p=${slug}&r=1`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head>
<body>
<p>Loading property...</p>
<script>window.location.replace("${redirectUrl}");</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).send(html);
};