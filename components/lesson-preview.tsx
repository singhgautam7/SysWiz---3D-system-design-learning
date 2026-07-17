import type { Dimension } from "@/lib/content/schema";

/**
 * Lightweight decorative preview for a lesson card. Pure SVG — no Three.js on
 * the home route (perf budget: keep the library route lean).
 */
export function LessonPreview({ dimension }: { dimension: Dimension }) {
  return (
    <div className="relative h-[120px] w-full overflow-hidden border-b border-border bg-gradient-to-b from-surface-2 to-surface">
      {dimension === "3d" ? <RackMotif /> : <QueueMotif />}
    </div>
  );
}

function RackMotif() {
  // A load balancer fanning out to a small fleet of isometric server racks.
  return (
    <svg
      viewBox="0 0 320 120"
      className="h-full w-full"
      role="img"
      aria-label="3D scene preview: a load balancer distributing to a fleet of servers"
    >
      <line x1="60" y1="60" x2="140" y2="38" stroke="#5B8CFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="60" y1="60" x2="140" y2="60" stroke="#5B8CFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="60" y1="60" x2="140" y2="82" stroke="#5B8CFF" strokeWidth="1.5" opacity="0.6" />
      <g>
        <rect x="44" y="46" width="28" height="28" rx="4" fill="#101215" stroke="#4CFFB2" strokeWidth="1.5" transform="rotate(45 58 60)" />
      </g>
      {[38, 60, 82].map((y, i) => (
        <rect
          key={i}
          x="136"
          y={y - 11}
          width="22"
          height="22"
          rx="3"
          fill="#0A0B0D"
          stroke="#00E28A"
          strokeWidth="1.5"
        />
      ))}
      {[38, 60, 82].map((y, i) => (
        <line key={`c${i}`} x1="158" y1={y} x2="250" y2="60" stroke="#B8BFCC" strokeWidth="1" opacity="0.4" />
      ))}
      <rect x="250" y="46" width="26" height="28" rx="4" fill="#101215" stroke="#B48BFF" strokeWidth="1.5" />
    </svg>
  );
}

function QueueMotif() {
  // Producer → queue rows → consumer, mono MSG chips.
  return (
    <svg
      viewBox="0 0 320 120"
      className="h-full w-full"
      role="img"
      aria-label="2D animation preview: producers filling a queue drained by a consumer"
    >
      <rect x="20" y="42" width="52" height="20" rx="4" fill="#0A0B0D" stroke="#5B8CFF" strokeWidth="1.2" />
      <text x="46" y="56" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#B8BFCC">
        producer
      </text>
      {[36, 54, 72].map((y, i) => (
        <g key={i}>
          <rect x="132" y={y} width="56" height="14" rx="3" fill="#101215" stroke="#00E28A" strokeWidth="1" opacity={1 - i * 0.22} />
          <text x="160" y={y + 10} textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#B8BFCC">
            MSG {44 - i}
          </text>
        </g>
      ))}
      <line x1="72" y1="52" x2="130" y2="52" stroke="#5B8CFF" strokeWidth="1.2" opacity="0.5" />
      <line x1="190" y1="52" x2="248" y2="52" stroke="#00E28A" strokeWidth="1.2" opacity="0.5" />
      <rect x="248" y="42" width="52" height="20" rx="4" fill="#0A0B0D" stroke="#FFB84D" strokeWidth="1.2" />
      <text x="274" y="56" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#B8BFCC">
        consumer
      </text>
    </svg>
  );
}
