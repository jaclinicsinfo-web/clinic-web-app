import Image from "next/image";

import { cn } from "@/lib/utils";

const ASSETS = {
  full: { src: "/brand/logo-ja-clinics.png", width: 940, height: 680 },
  compact: { src: "/brand/logo-ja-clinics-compacta.png", width: 890, height: 520 },
  mark: { src: "/brand/marca-ja-clinics.png", width: 560, height: 560 },
} as const;

interface BrandLogoProps {
  variant?: keyof typeof ASSETS;
  onDark?: boolean;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ variant = "full", onDark = false, className, priority }: BrandLogoProps) {
  const asset = ASSETS[variant];

  return (
    <Image
      src={asset.src}
      alt="J.A Clinics"
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={cn("h-auto max-w-full object-contain", onDark && "brightness-0 invert", className)}
    />
  );
}
