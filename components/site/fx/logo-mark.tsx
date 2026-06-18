import { cn } from "@/utils/cn";

/** Brand mark silhouette, vectorized from `public/logo.png` (the forward-chevron
 *  "R"). Decorative, static background watermark. Fill + opacity live in
 *  `.logo-mark` (fx.css). */
const LOGO_PATH =
  "M 10.9 1.71 L 8.67 4.05 L 7.47 7.07 L 7.42 9.87 L 8.44 12.89 L 9.36 14.2 L 30.06 35.03 L 8.96 56.25 L 7.87 58.24 L 7.36 60.52 L 7.59 63.38 L 8.96 66.29 L 11.81 68.8 L 70.91 99.14 L 73.25 99.77 L 75.36 99.77 L 77.24 99.32 L 79.29 98.23 L 81.46 95.95 L 82.6 93.21 L 82.66 89.73 L 81.63 86.94 L 80.66 85.57 L 64.12 69.02 L 85.17 47.92 L 88.02 44.15 L 90.42 39.53 L 92.24 32.86 L 92.41 25.61 L 90.7 18.37 L 87.62 12.49 L 83.29 7.53 L 78.84 4.22 L 73.47 1.71 L 67.88 0.4 L 15.63 0.11 L 12.78 0.68 Z";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn("logo-mark", className)}
    >
      <path d={LOGO_PATH} />
    </svg>
  );
}
