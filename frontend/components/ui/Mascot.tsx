import Image from "next/image";

export type MascotVariant = "happy" | "sad" | "serious" | "blank";

const sources: Record<MascotVariant, string> = {
  happy: "/mascot/mascot_happy.png",
  sad: "/mascot/mascot_sad.png",
  serious: "/mascot/mascot_serious.png",
  blank: "/mascot/mascot_with_no_face.png",
};

export interface MascotProps {
  variant?: MascotVariant;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function Mascot({ variant = "happy", size = 96, className = "", priority }: MascotProps) {
  return (
    <Image
      src={sources[variant]}
      alt="Ding, o mascote do Sistema de Pedidos"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
