"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface AnimatedBackgroundProps {
  className?: string
  density?: number
  speed?: number
  color?: string
  secondaryColor?: string
  children?: React.ReactNode
}

export function AnimatedBackground({
  className = "",
  density = 5, // Reduced default density for better performance
  speed = 2,
  color = "rgba(99, 102, 241, 0.8)",
  secondaryColor = "rgba(236, 72, 153, 0.8)",
  children,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Respect prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let particles: {
      x: number
      y: number
      radius: number
      color: string
      speedX: number
      speedY: number
      directionX: number
      directionY: number
    }[] = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 20000) * density // Fewer particles per area

      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 5 + 1
        const x = Math.random() * (canvas.width - radius * 2) + radius
        const y = Math.random() * (canvas.height - radius * 2) + radius
        const speedX = (Math.random() - 0.5) * speed
        const speedY = (Math.random() - 0.5) * speed
        const particleColor = Math.random() > 0.5 ? color : secondaryColor

        particles.push({
          x,
          y,
          radius,
          color: particleColor,
          speedX,
          speedY,
          directionX: speedX > 0 ? 1 : -1,
          directionY: speedY > 0 ? 1 : -1,
        })
      }
    }

    let animationFrameId: number;
    let lastTimestamp = 0;
    const targetFPS = 30; // Cap animation to 30 FPS for performance
    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (timestamp - lastTimestamp < 1000 / targetFPS) return;
      lastTimestamp = timestamp;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        // Bounce off edges
        if (particle.x + particle.radius > canvas.width || particle.x - particle.radius < 0) {
          particle.speedX = -particle.speedX;
        }
        if (particle.y + particle.radius > canvas.height || particle.y - particle.radius < 0) {
          particle.speedY = -particle.speedY;
        }
        // Connect particles
        connectParticles(particle);
      });
    };

    const connectParticles = (particle: (typeof particles)[0]) => {
      const connectionDistance = 150
      particles.forEach((otherParticle) => {
        if (particle === otherParticle) return

        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance
          ctx.beginPath()
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`
          ctx.lineWidth = 1
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  }, [density, speed, color, secondaryColor])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10" style={{ background: "transparent" }} />
      {children}
    </div>
  )
}
