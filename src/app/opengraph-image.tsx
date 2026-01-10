import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "PDFflow - PDF Tools That Just Flow";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "20%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
            borderRadius: "32px",
            marginBottom: "40px",
            boxShadow: "0 20px 60px rgba(14, 165, 233, 0.4)",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14,2 14,8 20,8" />
            <path d="M12 18v-6" />
            <path d="m9 15 3 3 3-3" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          PDF
          <span
            style={{
              background: "linear-gradient(90deg, #0ea5e9, #06b6d4)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            flow
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            color: "#94a3b8",
            marginBottom: "48px",
          }}
        >
          PDF Tools That Just Flow
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "24px",
          }}
        >
          {["Fast", "Private", "Free"].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "100px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#10b981",
                  borderRadius: "50%",
                }}
              />
              <span style={{ color: "white", fontSize: "20px" }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
