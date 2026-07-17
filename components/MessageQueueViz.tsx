"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  initialQueueState,
  tick,
  isBackpressured,
  type QueueState,
} from "./queue-logic";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const CONSUMER_RATE = 3; // msgs/sec, single fixed consumer (v1)
const TICK_MS = 140;
const DT = TICK_MS / 1000;
const MAX_ROWS = 7;
const SEED_DEPTH = 3;

const PRODUCERS = [
  { id: "payments", label: "payments-svc" },
  { id: "orders", label: "orders-svc" },
  { id: "emails", label: "emails-svc" },
];

export function MessageQueueViz() {
  // Resolves to false on first paint, then to the real value after mount.
  const prefersReduced = usePrefersReducedMotion();

  const [state, setState] = useState<QueueState>(() =>
    initialQueueState(SEED_DEPTH),
  );
  const [producerRate, setProducerRate] = useState(6);
  // null = follow the motion preference (autoplay unless reduced motion, which
  // keeps a static first frame — a11y). Once the user acts, their choice wins.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !prefersReduced;

  const advance = useCallback(
    (dt: number) => {
      setState((prev) =>
        tick(prev, { producerRate, consumerRate: CONSUMER_RATE }, dt),
      );
    },
    [producerRate],
  );

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => advance(DT), TICK_MS);
    return () => clearInterval(interval);
  }, [playing, advance]);

  const depth = state.queue.length;
  const backpressure = isBackpressured({
    producerRate,
    consumerRate: CONSUMER_RATE,
  });
  const visible = state.queue.slice(0, MAX_ROWS);
  const overflow = depth - visible.length;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border-2 bg-black">
      {/* HUD */}
      <div className="flex items-center gap-4 border-b border-border bg-surface px-3 py-2 font-mono text-[10px]">
        <Metric label="ARRIVAL" value={`${producerRate.toFixed(0)}/s`} />
        <Metric label="DRAIN" value={`${CONSUMER_RATE}/s`} />
        <Metric
          label="DEPTH"
          value={`${depth}${backpressure ? " ↑" : ""}`}
          className={backpressure ? "text-[#FFB84D]" : "text-emerald"}
        />
        <span className="ml-auto text-muted-fg">delivered {state.delivered}</span>
      </div>

      {/* Scene */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-5 sm:gap-4 sm:px-5">
        {/* Producers */}
        <div className="flex flex-col gap-1.5">
          {PRODUCERS.map((p, i) => (
            <div
              key={p.id}
              className="rounded-md border border-[#5B8CFF]/30 bg-surface-2 px-2 py-1.5"
            >
              <p className="font-mono text-[10px] text-text-2">{p.label}</p>
              <p className="font-mono text-[9px] text-muted-fg">
                ~{(producerRate / PRODUCERS.length).toFixed(1)}/s
              </p>
              {playing && !prefersReduced && producerRate > 0 && (
                <motion.span
                  className="mt-1 block h-0.5 rounded bg-[#5B8CFF]"
                  animate={{ scaleX: [0, 1] }}
                  transition={{
                    duration: PRODUCERS.length / Math.max(producerRate, 0.5),
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.2,
                  }}
                  style={{ originX: 0 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Queue */}
        <div className="flex w-[110px] flex-col items-stretch gap-1 rounded-lg border border-emerald/40 bg-surface/60 p-1.5 sm:w-[140px]">
          <p className="text-center font-mono text-[9px] uppercase tracking-wide text-emerald">
            queue · depth {depth}
          </p>
          <div className="flex flex-col gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  layout={!prefersReduced}
                  initial={prefersReduced ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    prefersReduced
                      ? { opacity: 0 }
                      : { opacity: 0, x: 40, transition: { duration: 0.14 } }
                  }
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "rounded border px-1.5 py-1 text-center font-mono text-[10px]",
                    idx === 0
                      ? "border-emerald/60 bg-emerald/10 text-emerald"
                      : "border-border-2 bg-surface-2 text-text-2",
                  )}
                >
                  {msg.label}
                </motion.div>
              ))}
            </AnimatePresence>
            {overflow > 0 && (
              <p className="text-center font-mono text-[9px] text-muted-fg">
                +{overflow} more
              </p>
            )}
            {depth === 0 && (
              <p className="py-2 text-center font-mono text-[9px] text-muted-fg">
                empty
              </p>
            )}
          </div>
        </div>

        {/* Consumer */}
        <div className="justify-self-end">
          <div className="rounded-md border border-[#FFB84D]/30 bg-surface-2 px-2 py-1.5">
            <p className="font-mono text-[10px] text-text-2">worker-01</p>
            <p className="font-mono text-[9px] text-muted-fg">
              {state.processing ? `proc ${state.processing.label}` : "idle"}
            </p>
          </div>
        </div>
      </div>

      {backpressure && (
        <p className="border-t border-[#FFB84D]/30 bg-[#FFB84D]/[0.06] px-3 py-1.5 font-mono text-[10px] text-[#FFB84D]">
          ⚠ back-pressure: arrival &gt; drain — the queue is growing without bound.
        </p>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface px-3 py-2.5">
        <button
          onClick={() => setUserPlaying(!playing)}
          className="min-h-[36px] rounded-md border border-border-2 bg-surface px-3 font-mono text-[11px] text-text transition-colors hover:border-border-3"
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          onClick={() => {
            setUserPlaying(false);
            advance(DT * 3);
          }}
          className="min-h-[36px] rounded-md border border-border-2 bg-surface px-3 font-mono text-[11px] text-text-2 transition-colors hover:border-border-3"
        >
          Step ⏭
        </button>
        <button
          onClick={() => {
            setUserPlaying(false);
            setState(initialQueueState(SEED_DEPTH));
          }}
          className="min-h-[36px] rounded-md border border-border-2 bg-surface px-3 font-mono text-[11px] text-muted-fg transition-colors hover:border-border-3"
        >
          Reset
        </button>

        <label className="ml-auto flex min-w-[180px] flex-1 items-center gap-2 sm:flex-none">
          <span className="font-mono text-[10px] text-muted-fg">RATE</span>
          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={producerRate}
            onChange={(e) => setProducerRate(Number(e.target.value))}
            aria-label="Producer rate (messages per second)"
            className="h-1.5 flex-1 cursor-pointer accent-[#00E28A]"
          />
          <span className="w-10 text-right font-mono text-[10px] text-text-2">
            {producerRate}/s
          </span>
        </label>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-muted-fg">{label}</span>
      <span className={cn("text-text-2", className)}>{value}</span>
    </span>
  );
}
