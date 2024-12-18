'use client'

import React, { useEffect, useRef } from 'react'

export const BackgroundGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawGrid = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.1)'
      ctx.lineWidth = 0.5

      const cellSize = 50  
      for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw aura
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2  // Increased radius for a more expansive aura
      )
      gradient.addColorStop(0, 'rgba(45, 212, 191, 0.15)') // Slightly more intense turquoise
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)') // Slightly more intense green
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    drawGrid()
    window.addEventListener('resize', drawGrid)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('resize', drawGrid)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}

