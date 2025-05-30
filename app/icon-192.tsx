import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 192,
  height: 192,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 160,
        background: "linear-gradient(to bottom right, #4ADE80, #16A34A)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22%",
        color: "white",
        fontWeight: "bold",
      }}
    >
      IS
    </div>,
    { ...size },
  )
}
