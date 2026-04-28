"use client";

import { CookieFlow } from "./CookieFlow";

export function Footer() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#0d0905",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Cookie flow background ── */}
      <CookieFlow />

      {/* ── All content sits above the canvas ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >

        {/* ── TOP: Logo + Nav ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "0.2em" }}>ORYZO</span>
          <div style={{ display: "flex", gap: "28px" }}>
            {["INTRO", "FEATURES", "PRODUCT", "CONTACT"].map((item, i) => (
              <span
                key={item}
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  cursor: "pointer",
                  opacity: i === 3 ? 1 : 0.5,
                  borderBottom: i === 3 ? "1px dashed rgba(255,255,255,0.7)" : "none",
                  paddingBottom: i === 3 ? 3 : 0,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── MIDDLE: L-bracket + Headlines ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
          {/* L bracket */}
          <div
            style={{
              flexShrink: 0,
              width: 48,
              height: 70,
              borderLeft: "18px solid #fceee0",
              borderBottom: "18px solid #fceee0",
              marginTop: 6,
              opacity: 0.9,
            }}
          />
          {/* Text block */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 4vw, 3.6rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                color: "#fff8f0",
                marginBottom: "20px",
              }}
            >
              We caught your attention<br />with a non-existent product.
            </h1>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(1.4rem, 3.2vw, 2.9rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                color: "#fff8f0",
              }}
            >
              If we can sell a coaster,<br />imagine what we can do for your brand.
            </h2>
          </div>
          {/* CTA button */}
          <div style={{ flexShrink: 0, alignSelf: "flex-end" }}>
            <button
              style={{
                padding: "14px 32px",
                background: "rgba(50,30,14,0.9)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 100,
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              LUSION.CO
            </button>
          </div>
        </div>

        {/* ── BOTTOM: Three columns ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr 200px",
            gap: "40px",
            paddingTop: "28px",
            borderTop: "1px dashed rgba(255,255,255,0.12)",
            alignItems: "end",
          }}
        >

          {/* Col 1 — Share card + legal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                padding: "16px 20px",
                border: "1px dashed rgba(255,255,255,0.22)",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px 0",
                  color: "#ff5500",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  lineHeight: 1.5,
                }}
              >
                BUILT BY LUSION<br />WITH LOVE <span style={{ color: "#ff3333" }}>❤</span>
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <p style={{ margin: 0, fontSize: "9px", opacity: 0.7, letterSpacing: "0.08em", lineHeight: 1.5, textTransform: "uppercase" }}>
                  Share with friends<br />if you like it
                </p>
                <button
                  style={{
                    padding: "6px 14px",
                    border: "1px dashed rgba(255,255,255,0.4)",
                    background: "transparent",
                    color: "#fff",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Copy URL
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: "20px", fontSize: "10px", letterSpacing: "0.06em", opacity: 0.5 }}>
              <a href="#" style={{ color: "#fff", textDecoration: "none", textTransform: "uppercase" }}>Terms &amp; Conditions</a>
              <a href="#" style={{ color: "#fff", textDecoration: "none", textTransform: "uppercase" }}>Privacy Policy</a>
            </div>
          </div>

          {/* Col 2 — Newsletter + Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <p style={{ margin: "0 0 10px 0", fontSize: "9px", opacity: 0.45, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Subscribe to Lusion's Newsletter:
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px dashed rgba(255,255,255,0.28)",
                  paddingBottom: 7,
                  gap: 8,
                }}
              >
                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "#fff",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                  }}
                />
                <span style={{ fontSize: "16px", opacity: 0.6, cursor: "pointer" }}>→</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "40px", fontSize: "10px", letterSpacing: "0.05em" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", opacity: 0.45, textTransform: "uppercase", fontSize: "9px" }}>New Business:</p>
                <a href="mailto:business@lusion.co" style={{ color: "#fff", textDecoration: "none", textTransform: "uppercase" }}>
                  BUSINESS@LUSION.CO
                </a>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", opacity: 0.45, textTransform: "uppercase", fontSize: "9px" }}>General Enquiries:</p>
                <a href="mailto:hello@lusion.co" style={{ color: "#fff", textDecoration: "none", textTransform: "uppercase" }}>
                  HELLO@LUSION.CO
                </a>
              </div>
            </div>
          </div>

          {/* Col 3 — Socials + disclaimer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
              {["X", "INSTAGRAM", "LINKEDIN"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    opacity: 0.7,
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "8px",
                lineHeight: 1.65,
                opacity: 0.28,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                textAlign: "right",
              }}
            >
              This entire site is a fictional creative project by Lusion. Oryzo doesn't exist.
              No products are for sale. All claims are satirical and for entertainment purposes only.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
