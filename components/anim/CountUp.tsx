"use client";
import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

export default function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    // separa número de sufijo: "1.200+" → 1200 + "+", "98%" → 98 + "%", "4,5★" → 4.5 + "★"
    const isDecimal = /\d,\d/.test(value);
    const numStr = value.replace(/[^\d,]/g, "").replace(",", ".");
    const target = parseFloat(numStr);
    const suffix = value.replace(/[\d.,]/g, "");
    const hasThousands = !isDecimal && value.includes(".");
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const current = target * eased;
      let formatted: string;
      if (isDecimal) {
        formatted = current.toFixed(1).replace(".", ",");
      } else if (hasThousands) {
        formatted = Math.round(current).toLocaleString("es-CL");
      } else {
        formatted = String(Math.round(current));
      }
      setDisplay(formatted + suffix);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}
