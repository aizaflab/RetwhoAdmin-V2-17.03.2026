"use client";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 2,
}));

export default function DustParticles() {
  return (
    <div className="absolute pointer-events-none w-200 -right-96 top-0 h-55 -rotate-45">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gray-400 animate-dust-particle"
          style={{
            width: "1px",
            height: "1px",
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow:
              "0 0 4px rgba(255, 255, 255, 0.9), 0 0 2px rgba(255, 255, 255, 1)",
          }}
        />
      ))}
    </div>
  );
}
