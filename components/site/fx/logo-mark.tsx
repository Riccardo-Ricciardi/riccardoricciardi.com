import { cn } from "@/utils/cn";

const LOGO_PATH =
  "M 4.16 1.48 L 0 7.79 L 1.14 14.84 L 26.6 40.77 L 1.61 65.95 L 1.61 77.5 L 74.61 116.32 L 84.69 115.18 L 87.37 102.01 L 66.76 80.79 L 97.65 46.21 L 100 29.48 L 94.16 13.97 L 83.61 4.3 L 70.85 0 Z";

/** Wireframe outline of the brandmark, traced from the logo silhouette.
 *  Decorative watermark. Stroke + group-hover accent live in `.logo-mark`
 *  (fx.css); pass `hero-logo-mark` for the edge-fade mask. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 116.32"
      fill="none"
      aria-hidden="true"
      className={cn("logo-mark", className)}
    >
      <path
        d={LOGO_PATH}
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
