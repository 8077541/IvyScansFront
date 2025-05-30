import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 512,
  height: 512,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 400,
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
