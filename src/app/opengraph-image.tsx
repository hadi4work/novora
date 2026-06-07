import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const buffer = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${buffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ fontSize: 72, fontWeight: 700 }}>{APP_NAME}</div>
          <div style={{ fontSize: 36, marginTop: 16, opacity: 0.9 }}>
            {APP_TAGLINE}
          </div>
          <div style={{ fontSize: 24, marginTop: 40, opacity: 0.75 }}>
            AI content tools for creators, businesses & job seekers
          </div>
        </div>
        <img src={logoSrc} width={200} height={200} alt="" />
      </div>
    ),
    { ...size }
  );
}
