import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

interface RenderOgProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  brand: string;
}

export function renderOg({ eyebrow, title, subtitle, brand }: RenderOgProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #111827 60%, #0a0a0a 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.18) 0%, transparent 55%)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              R.
            </div>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 18,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              {brand}
            </div>
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#60a5fa",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                marginTop: 28,
                fontSize: 32,
                color: "#cbd5e1",
                lineHeight: 1.35,
                maxWidth: 940,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    ),
    ogSize
  );
}
