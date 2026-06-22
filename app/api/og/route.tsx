import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "MealMind Recipe";
  const cuisine = searchParams.get("cuisine") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #18181b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            width: 500,
            height: 300,
            borderRadius: "50%",
            background: "rgba(74,222,128,0.15)",
            filter: "blur(80px)",
            transform: "translateX(-50%)",
          }}
        />

        {/* Cuisine badge */}
        {cuisine && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: "rgba(74,222,128,0.15)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: 20,
                padding: "6px 16px",
                color: "#4ade80",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              {cuisine}
            </div>
          </div>
        )}

        {/* Recipe title */}
        <div
          style={{
            color: "#ffffff",
            fontSize: title.length > 30 ? 56 : 68,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 22,
            marginTop: 28,
            letterSpacing: "0.01em",
          }}
        >
          Cook it with ingredients you already have
        </div>

        {/* Brand bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 72,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🥗
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            MealMind
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
