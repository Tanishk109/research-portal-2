"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface Shape {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  color: string
  type: "circle" | "square" | "triangle"
  speed: number
  opacity: number
}

interface AnimatedShapesProps {
  className?: string
  count?: number
  children?: React.ReactNode
}

export function AnimatedShapes({ className = "", count = 15, children }: AnimatedShapesProps) {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const colors = [
      "rgba(99, 102, 241, 0.3)", // primary
      "rgba(236, 72, 153, 0.3)", // secondary
      "rgba(139, 92, 246, 0.3)", // accent
      "rgba(6, 182, 212, 0.3)", // tertiary
    ]

    const types: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"]

    const newShapes: Shape[] = []
    for (let i = 0; i < count; i++) {
      newShapes.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 60 + 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)],
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }
    setShapes(newShapes)

    const interval = setInterval(() => {
      setShapes((prevShapes) =>
        prevShapes.map((shape) => {
          let newY = shape.y + shape.speed
          if (newY > dimensions.height + shape.size) {
            newY = -shape.size
          }
          return {
            ...shape,
            y: newY,
            rotation: (shape.rotation + shape.speed * 0.5) % 360,
          }
        }),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [dimensions, count])

  const renderShape = (shape: Shape) => {
    const style = {
      left: `${shape.x}px`,
      top: `${shape.y}px`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      backgroundColor: shape.type === "circle" || shape.type === "square" ? shape.color : "transparent",
      borderRadius: shape.type === "circle" ? "50%" : "0",
      transform: `rotate(${shape.rotation}deg)`,
      opacity: shape.opacity,
      position: "absolute" as const,
      zIndex: -1,
      transition: "transform 0.5s ease-out",
    }

    if (shape.type === "triangle") {
      return (
        <div
          key={shape.id}
          style={{
            ...style,
            backgroundColor: "transparent",
            width: 0,
            height: 0,
            borderLeft: `${shape.size / 2}px solid transparent`,
            borderRight: `${shape.size / 2}px solid transparent`,
            borderBottom: `${shape.size}px solid ${shape.color}`,
          }}
        />
      )
    }

    return <div key={shape.id} style={style} />
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {shapes.map(renderShape)}
      {children}
    </div>
  )
}
