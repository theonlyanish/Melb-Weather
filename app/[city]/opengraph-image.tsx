import { ImageResponse } from "next/og";
import { fetchWeatherData } from "@/lib/weatherService";
import { resolveCity, getCityMicrotext } from "@/lib/cities";

export const alt = "LocalSky - Australian Weather Forecast";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Rotate the tagline daily so shared cards stay fresh without being
// random per-request (random would bust social platforms' image caches).
function pickMicrotext(lines: string[]): string {
  if (!lines.length) return "Australian weather, with personality.";
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return lines[dayOfYear % lines.length];
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const resolved = resolveCity(city);
  const cityName = resolved?.displayName || "Australia";
  const tagline = pickMicrotext(resolved ? getCityMicrotext(resolved) : []);

  let temp: number | null = null;
  let condition = "";
  if (resolved) {
    try {
      const live = await fetchWeatherData(resolved.cityKey);
      temp = live.current.temp;
      condition = live.current.condition;
    } catch {
      // No live data — render the brand card without the temperature block
    }
  }

  const conditionLabel = condition
    ? condition.charAt(0).toUpperCase() + condition.slice(1)
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #dbeafe 0%, #ffffff 45%, #f3e8ff 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Soft background blobs echoing the app's gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(147,197,253,0.45) 0%, rgba(147,197,253,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(216,180,254,0.45) 0%, rgba(216,180,254,0) 70%)",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: -2,
            }}
          >
            LocalSky
          </div>
          <div style={{ fontSize: 28, color: "#475569", marginTop: 8 }}>
            Australian weather, with personality
          </div>
        </div>

        {/* Live conditions */}
        {temp !== null ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
            <div style={{ fontSize: 200, fontWeight: 800, color: "#1d4ed8", lineHeight: 1 }}>
              {`${temp}°`}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingBottom: 24,
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 700, color: "#0f172a" }}>
                {cityName}
              </div>
              <div style={{ fontSize: 36, color: "#475569" }}>{conditionLabel}</div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 88, fontWeight: 800, color: "#1d4ed8" }}>
            {cityName}
          </div>
        )}

        {/* Daily microcopy — the gimmick, front and centre */}
        <div
          style={{
            fontSize: 40,
            fontStyle: "italic",
            color: "#334155",
          }}
        >
          {`“${tagline}”`}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
