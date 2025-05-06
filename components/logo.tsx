import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
}

export function Logo({ className, size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const fillColor = variant === "white" ? "#FFFFFF" : "#22C55E"
  const textColor = variant === "white" ? "text-white" : "text-green-500"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg className={sizeClasses[size]} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C35.046 44 44 35.046 44 24C44 12.954 35.046 4 24 4ZM24 40C15.178 40 8 32.822 8 24C8 15.178 15.178 8 24 8C32.822 8 40 15.178 40 24C40 32.822 32.822 40 24 40Z"
          fill={fillColor}
          fillOpacity="0.2"
        />
        <path
          d="M24 12C17.373 12 12 17.373 12 24C12 30.627 17.373 36 24 36C30.627 36 36 30.627 36 24C36 17.373 30.627 12 24 12ZM24 32C19.589 32 16 28.411 16 24C16 19.589 19.589 16 24 16C28.411 16 32 19.589 32 24C32 28.411 28.411 32 24 32Z"
          fill={fillColor}
          fillOpacity="0.4"
        />
        <path
          d="M32 24C32 28.4183 28.4183 32 24 32C19.5817 32 16 28.4183 16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24Z"
          fill={fillColor}
        />
        {/* Ivy Leaf 1 */}
        <path d="M36 14C36 14 32 18 32 24C32 30 36 34 36 34C36 34 40 30 40 24C40 18 36 14 36 14Z" fill={fillColor} />
        {/* Ivy Leaf 2 */}
        <path d="M12 14C12 14 8 18 8 24C8 30 12 34 12 34C12 34 16 30 16 24C16 18 12 14 12 14Z" fill={fillColor} />
        {/* Ivy Leaf 3 */}
        <path d="M24 36C24 36 20 32 14 32C8 32 4 36 4 36C4 36 8 40 14 40C20 40 24 36 24 36Z" fill={fillColor} />
        {/* Ivy Leaf 4 */}
        <path d="M24 12C24 12 28 8 34 8C40 8 44 12 44 12C44 12 40 16 34 16C28 16 24 12 24 12Z" fill={fillColor} />
      </svg>
      <span
        className={cn("font-bold", textColor, {
          "text-lg": size === "sm",
          "text-xl": size === "md",
          "text-2xl": size === "lg",
        })}
      >
        Ivy Scans
      </span>
    </div>
  )
}
