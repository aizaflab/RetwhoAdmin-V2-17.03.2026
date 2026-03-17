"use client";

import { useEffect, useRef } from "react";

interface NoiseBackgroundProps {
  opacity?: number; // Opacity of noise (0 to 1)
  density?: number; // Density of noise particles (0 to 1)
  animated?: boolean; // Whether noise should animate
  className?: string;
  zIndex?: number;
}

export default function NoiseBackground({
  opacity = 0.03,
  density = 1,
  animated = false,
  className = "",
  zIndex = 1,
}: NoiseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate noise texture
    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Apply density - skip some pixels based on density value
        if (Math.random() > density) {
          continue;
        }

        const noise = Math.random() * 255;
        const alpha = Math.random() * opacity;

        data[i] = noise; // R
        data[i + 1] = noise; // G
        data[i + 2] = noise; // B
        data[i + 3] = alpha * 255; // A
      }

      return imageData;
    };

    let animationFrameId: number;

    if (animated) {
      // Animated noise
      const animate = () => {
        const noiseTexture = generateNoise();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(noiseTexture, 0, 0);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    } else {
      // Static noise
      const noiseTexture = generateNoise();
      ctx.putImageData(noiseTexture, 0, 0);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animated) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [opacity, density, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex }}
    />
  );
}
