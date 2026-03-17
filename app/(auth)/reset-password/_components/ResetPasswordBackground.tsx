"use client";

import NoiseBackground from "@/components/ui/NoiseBackground";

export default function ResetPasswordBackground() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        <NoiseBackground
          opacity={0.03}
          density={1}
          animated={false}
          zIndex={1}
        />
      </div>
    </>
  );
}
