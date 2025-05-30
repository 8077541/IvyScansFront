import { ImageResponse } from "next/og"
import { comicService } from "@/lib/api"

// Route segment config
export const runtime = "edge"
export const revalidate = 3600 // Revalidate every hour

// Image metadata
export const alt = "Comic Details"
export const size = {
  width: 1200,
  height: 630,
}

// Image generation
export default async function Image({ params }: { params: { id: string } }) {
  try {
    // Fetch comic data
    const comic = await comicService.getComicById(params.id)

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          background: "linear-gradient(to bottom right, #4ADE80, #16A34A)",
          width: "100%",
          height: "100%",
          padding: 50,
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {/* Cover image */}
        <div
          style={{
            display: "flex",
            width: 300,
            height: 450,
            borderRadius: 15,
            overflow: "hidden",
            marginRight: 50,
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <img
            src={comic.cover || "https://via.placeholder.com/300x450"}
            alt={comic.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Comic details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            color: "white",
            maxWidth: 700,
          }}
        >
          <h1 style={{ fontSize: 60, fontWeight: "bold", margin: 0, marginBottom: 10 }}>{comic.title}</h1>
          <p style={{ fontSize: 30, margin: 0, marginBottom: 10, opacity: 0.9 }}>
            {comic.status} • {comic.latestChapter}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
            {comic.genres.slice(0, 5).map((genre, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 24,
                }}
              >
                {genre}
              </div>
            ))}
          </div>
        </div>
      </div>,
      { ...size },
    )
  } catch (error) {
    // Fallback image on error
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          background: "linear-gradient(to bottom right, #4ADE80, #16A34A)",
          width: "100%",
          height: "100%",
          padding: 50,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: 60, fontWeight: "bold", margin: 0 }}>Ivy Scans</h1>
        <p style={{ fontSize: 30, margin: 0, marginTop: 20 }}>Discover amazing webcomics</p>
      </div>,
      { ...size },
    )
  }
}
