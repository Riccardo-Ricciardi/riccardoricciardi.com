import { ImageResponse } from "next/og";
import { APP_CONFIG, isSupportedLanguage } from "@/utils/config/app";

export const alt = "Riccardo Ricciardi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isSupportedLanguage(params.locale)
    ? params.locale
    : APP_CONFIG.defaultLanguage;

  const tagline =
    locale === "it"
      ? "Sito ufficiale"
      : "Official website";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>
          {APP_CONFIG.author.name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            opacity: 0.7,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    size
  );
}
