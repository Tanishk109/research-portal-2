import type React from "react"
interface GradientBackgroundProps {
  className?: string
  children?: React.ReactNode
  variant?: "primary" | "secondary" | "accent" | "rainbow"
  animate?: boolean
  intensity?: "light" | "medium" | "strong"
}

export function GradientBackground({
  className = "",
  children,
  variant = "primary",
  animate = true,
  intensity = "medium",
}: GradientBackgroundProps) {
  const getGradient = () => {
    const intensityMap = {
      light: "opacity-30",
      medium: "opacity-70",
      strong: "opacity-90",
    }

    const animationClass = animate ? "animate-gradient-xy" : ""
    const intensityClass = intensityMap[intensity]

    switch (variant) {
      case "primary":
        return `bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 ${animationClass} ${intensityClass}`
      case "secondary":
        return `bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 ${animationClass} ${intensityClass}`
      case "accent":
        return `bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 ${animationClass} ${intensityClass}`
      case "rainbow":
        return `bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-300% ${animationClass} ${intensityClass}`
      default:
        return `bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 ${animationClass} ${intensityClass}`
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`absolute inset-0 -z-10 ${getGradient()}`} />
      {children}
    </div>
  )
}
