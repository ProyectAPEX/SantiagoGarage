"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode } from "react";

export default function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 22 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 22 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const onMouseLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <div ref={ref} style={{ perspective: 900 }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className}>
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d", height: "100%" }}>
        {children}
      </motion.div>
    </div>
  );
}
