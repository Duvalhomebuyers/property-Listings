import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ───
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://csvnvhrrspzrvexsmqxa.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "sb_publishable_AU5DJs-qmoZ4wY7bOhXm5Q_6TwtpCxB";

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: options.method === "POST" ? "return=representation" : undefined,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const INITIAL_DATA = {
  address: "",
  askingPrice: "",
  shortDescription: "",
  beds: "",
  baths: "",
  sqft: "",
  yearBuilt: "",
  arv: "",
  rehabEstimate: "",
  monthlyRent: "",
  photosLink: "",
  heroImageUrl: "",
  photo1Url: "",
  photo2Url: "",
  mapImageUrl: "",
  comps: [
    { address: "", details: "" },
    { address: "", details: "" },
    { address: "", details: "" },
    { address: "", details: "" },
  ],
  contactName: "",
  callNumber: "",
  textNumber: "",
  email: "",
  showFeatures: false,
  features: ["", "", "", "", ""],
};

function formatCurrency(val) {
  if (!val) return "$0";
  const num = parseInt(val.toString().replace(/[^0-9]/g, ""), 10);
  if (isNaN(num)) return val;
  return "$" + num.toLocaleString();
}

// ─── FORM VIEW ───
function FormView({ data, setData, onGenerate, saving }) {
  const set = (key, val) => setData((d) => ({ ...d, [key]: val }));
  const setComp = (i, key, val) =>
    setData((d) => {
      const comps = [...d.comps];
      comps[i] = { ...comps[i], [key]: val };
      return { ...d, comps };
    });

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#666",
    marginBottom: "4px",
  };
  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#222",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "2px solid #222",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#222" }}>Property Listing Generator</h1>
          <p style={{ color: "#888", fontSize: "14px", marginTop: "6px" }}>Fill in details below to create a shareable property page</p>
        </div>

        <div style={{ background: "#fff", borderRadius: "8px", padding: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {/* PROPERTY INFO */}
          <div style={{ marginBottom: "28px" }}>
            <div style={sectionTitleStyle}>Property Info</div>
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Full Property Address</label>
              <input style={inputStyle} placeholder="39 Crompton Pl, Palm Coast, FL 32137" value={data.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Asking Price</label>
              <input style={inputStyle} placeholder="$199,900" value={data.askingPrice} onChange={(e) => set("askingPrice", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Short Description</label>
              <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} placeholder="Rare opportunity for golf course living..." value={data.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
            </div>
          </div>

          {/* ABOUT THE HOME */}
          <div style={{ marginBottom: "28px" }}>
            <div style={sectionTitleStyle}>About the Home</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                { key: "beds", label: "Beds", ph: "3" },
                { key: "baths", label: "Baths", ph: "2" },
                { key: "sqft", label: "SQFT", ph: "1483/1873" },
                { key: "yearBuilt", label: "Year Built", ph: "1974" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={inputStyle} placeholder={f.ph} value={data[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* NUMBERS */}
          <div style={{ marginBottom: "28px" }}>
            <div style={sectionTitleStyle}>The Numbers</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>ARV Opinion ($)</label>
                <input style={inputStyle} placeholder="325000" value={data.arv} onChange={(e) => set("arv", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Rehab Estimate</label>
                <input style={inputStyle} placeholder="Moderate, Light, $85,000, etc." value={data.rehabEstimate} onChange={(e) => set("rehabEstimate", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Est. Monthly Rent ($)</label>
                <input style={inputStyle} placeholder="2000" value={data.monthlyRent} onChange={(e) => set("monthlyRent", e.target.value)} />
              </div>
            </div>
          </div>

          {/* IMAGE URLS */}
          <div style={{ marginBottom: "28px" }}>
            <div style={sectionTitleStyle}>Image URLs</div>
            <p style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>Paste direct image URLs from Imgur, Dropbox, Google Drive, etc.</p>
            {[
              { key: "heroImageUrl", label: "Hero / Banner Image URL" },
              { key: "photo1Url", label: "Property Photo 1 URL" },
              { key: "photo2Url", label: "Property Photo 2 URL" },
              { key: "mapImageUrl", label: "Comps Map Image URL" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>{f.label}</label>
                <input style={inputStyle} placeholder="https://..." value={data[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                {data[f.key] && <img src={data[f.key]} alt="" style={{ marginTop: "6px", height: "80px", borderRadius: "4px", objectFit: "cover" }} onError={(e) => (e.target.style.display = "none")} />}
              </div>
            ))}
            <div>
              <label style={labelStyle}>Link to Full Photo Gallery</label>
              <input style={inputStyle} placeholder="https://dropbox.com/..." value={data.photosLink} onChange={(e) => set("photosLink", e.target.value)} />
            </div>
          </div>

          {/* COMPS */}
          <div style={{ marginBottom: "28px" }}>
            <div style={sectionTitleStyle}>Comps (up to 4)</div>
            {data.comps.map((comp, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "10px", padding: "12px", background: "#f9f9f9", borderRadius: "6px" }}>
                <div>
                  <label style={labelStyle}>Comp {i + 1} Address</label>
                  <input style={inputStyle} placeholder="16 Courtney Pl, Palm Coast, FL" value={comp.address} onChange={(e) => setComp(i, "address", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Details</label>
                  <input style={inputStyle} placeholder="2 Bed | 2 Bath | 1510 SQFT | SOLD FOR $352,500 ON 10/29/2025" value={comp.details} onChange={(e) => setComp(i, "details", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          {/* ADDITIONAL FEATURES (optional) */}
          <div style={{ marginBottom: "28px" }}>
            <div style={sectionTitleStyle}>Additional Features (Optional)</div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "12px", fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={data.showFeatures}
                onChange={(e) => set("showFeatures", e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              Include additional features section on property page
            </label>
            {data.showFeatures && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.features.map((feat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", color: "#666", minWidth: "14px" }}>•</span>
                    <input
                      style={inputStyle}
                      placeholder={`Feature ${i + 1} (e.g. "New roof installed 2024")`}
                      value={feat}
                      onChange={(e) => {
                        const updated = [...data.features];
                        updated[i] = e.target.value;
                        set("features", updated);
                      }}
                    />
                  </div>
                ))}
                <p style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>Leave fields blank to use fewer than 5. Only filled lines will display.</p>
              </div>
            )}
          </div>

          {/* CONTACT */}
          <div style={{ marginBottom: "28px" }}>
            <div style={sectionTitleStyle}>Contact Info</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { key: "contactName", label: "Contact Name", ph: "John Germaine" },
                { key: "callNumber", label: "Call Number", ph: "904-346-0600" },
                { key: "textNumber", label: "Text Number", ph: "904-349-4000" },
                { key: "email", label: "Email", ph: "john@wholesalejax.com" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={inputStyle} placeholder={f.ph} value={data[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={saving}
            style={{
              width: "100%", padding: "14px", fontSize: "16px", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: "2px", border: "none",
              borderRadius: "6px", color: "#fff", background: "#222",
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save & Generate Property Page →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROPERTY OUTPUT VIEW — faithful to cashflowjax.com reference ───
function PropertyView({ data, onBack, shareUrl }) {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sectionHeading = {
    fontSize: "24px",
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 24px 0",
    color: "#222",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Arial, sans-serif", color: "#222" }}>

      {/* TOP BAR for creator */}
      {onBack && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: "10px 16px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <button onClick={onBack} style={{ padding: "8px 16px", background: "#eee", border: "none", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>← Edit</button>
          <input readOnly value={shareUrl} style={{ flex: 1, fontSize: "12px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "6px", padding: "8px 12px", color: "#666" }} />
          <button onClick={copyLink} style={{ padding: "8px 18px", background: copied ? "#22c55e" : "#222", color: "#fff", border: "none", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}

      <div style={{ paddingTop: onBack ? "60px" : "0" }}>

        {/* HERO IMAGE + LOGO + ADDRESS OVERLAY */}
        <div style={{ position: "relative", width: "100%" }}>
          {data.heroImageUrl ? (
            <img src={data.heroImageUrl} alt="Property" className="property-hero" style={{ width: "100%", height: "500px", objectFit: "cover", display: "block" }} />
          ) : (
            <div className="property-hero" style={{ width: "100%", height: "500px", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No hero image</div>
          )}
          <div className="property-hero-overlay" style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.5))",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "20px",
          }}>
            <img
              src="https://static.wixstatic.com/media/f6a0b0_5a6ee2bcabd8487d91d5db349b37cf99~mv2.png/v1/fill/w_582,h_225,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Modernized%20Wholesale%20Logo%20(3).png"
              alt="Wholesale Realty"
              style={{ height: "90px", marginBottom: "20px" }}
            />
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: "0 0 12px 0", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {data.address || "Property Address"}
            </h1>
            {data.askingPrice && (
              <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff", margin: "0 0 12px 0", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                {data.askingPrice}
              </div>
            )}
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", maxWidth: "620px", lineHeight: "1.6", margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
              {data.shortDescription || "Property description goes here."}
            </p>
          </div>
        </div>

        {/* TWO PROPERTY PHOTOS */}
        <div className="photos-grid" style={{ maxWidth: "900px", margin: "30px auto", padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[data.photo1Url, data.photo2Url].map((url, i) => (
            <div key={i}>
              {url ? (
                <img src={url} alt={`Property ${i + 1}`} style={{ width: "100%", height: "280px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "280px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>No photo {i + 1}</div>
              )}
            </div>
          ))}
        </div>

        {/* CALL/TEXT FOR SHOWINGS */}
        <div style={{ textAlign: "center", padding: "24px 16px 16px" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px", color: "#222" }}>
            Call/Text for Showings
          </div>
          <a href={`tel:${data.callNumber}`} className="showings-phone" style={{ fontSize: "32px", fontWeight: "700", color: "#cc0000", textDecoration: "none" }}>
            {data.callNumber || "—"}
          </a>
        </div>

        {/* ABOUT THE HOME */}
        <div style={{ padding: "30px 16px", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={sectionHeading}>ABOUT THE HOME</h2>
            {[
              { label: "Beds", value: data.beds },
              { label: "Baths", value: data.baths },
              { label: "SQFT", value: data.sqft },
              { label: "Year Built", value: data.yearBuilt },
            ].map((item, i) => (
              <div key={i} style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                {item.label}: {item.value || "—"}
              </div>
            ))}
          </div>
        </div>

        {/* DO NOT CONTACT DISCLAIMER */}
        <div style={{ textAlign: "center", padding: "24px 16px 8px" }}>
          <div className="red-banner" style={{ fontSize: "28px", fontWeight: "700", color: "#cc0000", textTransform: "uppercase", letterSpacing: "2px", maxWidth: "900px", margin: "0 auto" }}>
            DO NOT CONTACT SELLER OR GO ON PROPERTY WITHOUT EXPRESS PERMISSION
          </div>
        </div>

        {/* ADDITIONAL FEATURES (only shown if enabled and has entries) */}
        {data.showFeatures && data.features && data.features.filter((f) => f.trim()).length > 0 && (
          <div style={{ textAlign: "center", padding: "20px 16px 8px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <h2 style={sectionHeading}>ADDITIONAL FEATURES</h2>
              <div style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
                {data.features.filter((f) => f.trim()).map((feat, i) => (
                  <div key={i} style={{ fontSize: "16px", marginBottom: "10px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: "#222", fontWeight: "700", fontSize: "18px", lineHeight: "1.2" }}>•</span>
                    <span style={{ lineHeight: "1.4" }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NUMBERS */}
        <div style={{ padding: "30px 16px", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={sectionHeading}>NUMBERS</h2>
            <div className="numbers-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "30px" }}>
              {[
                { value: formatCurrency(data.arv), label: "Wholesale Realty ARV Opinion" },
                { value: data.rehabEstimate || "—", label: "Rehab Estimate" },
                { value: formatCurrency(data.monthlyRent), label: "Estimated Monthly Rent" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="number-value" style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>{item.value}</div>
                  <div style={{ fontSize: "13px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>{item.label}</div>
                </div>
              ))}
            </div>
            {data.photosLink && (
              <div style={{ marginTop: "30px" }}>
                <a
                  href={data.photosLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block", padding: "14px 32px",
                    background: "#222", color: "#fff", textDecoration: "none",
                    fontWeight: "700", fontSize: "14px", textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  CLICK HERE TO SEE PHOTOS
                </a>
              </div>
            )}
          </div>
        </div>

        {/* COMPS */}
        <div style={{ padding: "30px 16px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={sectionHeading}>COMPS</h2>
            <div className="comps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", alignItems: "start" }}>
              <div>
                {data.comps.filter((c) => c.address).map((comp, i) => (
                  <div key={i} style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "700" }}>{comp.address}</div>
                    <div style={{ fontSize: "14px", color: "#555", marginTop: "4px" }}>{comp.details}</div>
                  </div>
                ))}
                {data.comps.filter((c) => c.address).length === 0 && (
                  <div style={{ color: "#999" }}>No comps entered</div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {data.mapImageUrl ? (
                  <img src={data.mapImageUrl} alt="Comps Map" style={{ maxWidth: "288px", maxHeight: "288px" }} />
                ) : (
                  <div style={{ width: "288px", height: "288px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>No map image</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SELLER FINANCING BANNER */}
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <div className="red-banner" style={{ fontSize: "28px", fontWeight: "700", color: "#cc0000", textTransform: "uppercase", letterSpacing: "2px" }}>
            SELLER FINANCING AVAILABLE*
          </div>
        </div>

        {/* CONTACT */}
        <div style={{ padding: "30px 16px", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ ...sectionHeading, marginBottom: "10px" }}>IF YOU ARE INTERESTED REACH OUT RIGHT AWAY</h2>
            <div className="contact-name" style={{ fontSize: "28px", fontWeight: "700", margin: "16px 0 24px", textTransform: "uppercase" }}>
              {data.contactName || "Contact Name"}
            </div>
            <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "500px", margin: "0 auto 20px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>CALL NOW</div>
                <a href={`tel:${data.callNumber}`} style={{ fontSize: "20px", fontWeight: "700", color: "#222", textDecoration: "none" }}>
                  {data.callNumber || "—"}
                </a>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>TEXT</div>
                <a href={`sms:${data.textNumber}`} style={{ fontSize: "20px", fontWeight: "700", color: "#222", textDecoration: "none" }}>
                  {data.textNumber || "—"}
                </a>
              </div>
            </div>
            {data.email && (
              <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                OR EMAIL ME AT: <a href={`mailto:${data.email}`} style={{ color: "#222", fontWeight: "700" }}>{data.email.toUpperCase()}</a>
              </div>
            )}
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{ padding: "24px 16px", textAlign: "center", borderTop: "1px solid #eee" }}>
          <p style={{ fontSize: "11px", color: "#888", maxWidth: "800px", margin: "0 auto", lineHeight: "1.7" }}>
            The estimates and assumptions presented above are not a guarantee for the performance of an investment. Prospective buyers should independently analyze and verify all assumptions on renovation costs, rental incomes, and comparable information contained above. John Germaine principal broker lic#BK3211672. Seller is marketing an assignable contract.
            <br /><br />
            By receipt of this communication recipient agrees to conduct all inquiries and discussions about the properties contained herein solely through Wholesale Realty, LLC and/or its affiliates, and shall not directly contact the seller and/or their representatives. Any unauthorized contact with the seller shall be considered intentional interference with a contract. Recipient acknowledges that Wholesale Realty, LLC and/or its affiliates will pursue damages if recipient attempts to circumvent or intentionally interfere with this contract. Recipient of this communication is in no way authorized to market the property contained herein without the express written authorization of Wholesale Realty, LLC.
            <br /><br />
            *Seller financing available for select properties at Seller's sole discretion. Financing may be subject to credit score and background check. Other restrictions may apply. Call for more information.
          </p>
        </div>
      </div>

      {/* RESPONSIVE MOBILE STYLES */}
      <style>{`
        @media (max-width: 768px) {
          .property-hero { height: 300px !important; }
          .property-hero-overlay h1 { font-size: 20px !important; }
          .property-hero-overlay p { font-size: 13px !important; }
          .property-hero-overlay img { height: 60px !important; }
          .photos-grid { grid-template-columns: 1fr !important; }
          .numbers-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .comps-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .red-banner { font-size: 20px !important; }
          .showings-phone { font-size: 26px !important; }
          .number-value { font-size: 24px !important; }
          .contact-name { font-size: 22px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [view, setView] = useState("loading");
  const [shareUrl, setShareUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isSharedView, setIsSharedView] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("p");
    if (id) {
      setIsSharedView(true);
      supabaseFetch(`/properties?slug=eq.${id}&select=*`)
        .then((rows) => {
          if (rows.length > 0) {
            setData(rows[0].data);
            setShareUrl(window.location.href);
            setView("preview");
          } else {
            setError("Property not found.");
            setView("form");
          }
        })
        .catch(() => {
          setError("Failed to load property.");
          setView("form");
        });
    } else {
      setIsSharedView(false);
      setView("form");
    }
  }, []);

  const generate = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const slug = generateId();
      await supabaseFetch("/properties", {
        method: "POST",
        body: JSON.stringify({ slug, data, address: data.address }),
      });
      const url = window.location.origin + window.location.pathname + "?p=" + slug;
      setShareUrl(url);
      setView("preview");
      window.history.pushState({}, "", url);
    } catch (e) {
      setError("Save failed: " + e.message);
    }
    setSaving(false);
  }, [data]);

  if (view === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 100, background: "#e53e3e", color: "#fff", padding: "10px 18px", borderRadius: "8px", fontSize: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{error}</div>
      )}
      {view === "form" ? (
        <FormView data={data} setData={setData} onGenerate={generate} saving={saving} />
      ) : (
        <PropertyView data={data} onBack={isSharedView ? null : () => { setView("form"); window.history.pushState({}, "", window.location.pathname); }} shareUrl={shareUrl} />
      )}
    </>
  );
}
