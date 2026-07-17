import { describe, it, expect } from "vitest";
import {
  initialQueueState,
  tick,
  isBackpressured,
  type QueueParams,
} from "./queue-logic";

function run(params: QueueParams, seconds: number, dt = 0.1) {
  let state = initialQueueState();
  for (let t = 0; t < seconds / dt; t++) state = tick(state, params, dt);
  return state;
}

describe("queue-logic", () => {
  it("grows when producers outrun the consumer", () => {
    const state = run({ producerRate: 10, consumerRate: 2 }, 5);
    // ~50 produced, ~10 consumed → depth roughly 40, certainly growing.
    expect(state.queue.length).toBeGreaterThan(20);
    expect(state.delivered).toBeGreaterThan(0);
  });

  it("drains to empty when the consumer outruns producers", () => {
    let state = initialQueueState(20);
    const params: QueueParams = { producerRate: 1, consumerRate: 10 };
    for (let t = 0; t < 60; t++) state = tick(state, params, 0.1);
    expect(state.queue.length).toBe(0);
  });

  it("stays balanced when rates match", () => {
    const state = run({ producerRate: 5, consumerRate: 5 }, 10);
    expect(state.queue.length).toBeLessThanOrEqual(2);
  });

  it("preserves FIFO order and monotonic ids", () => {
    const state = run({ producerRate: 8, consumerRate: 0 }, 2);
    const ids = state.queue.map((m) => m.id);
    const sorted = [...ids].sort((a, b) => a - b);
    expect(ids).toEqual(sorted);
    expect(state.queue[0]!.label).toBe("MSG 0");
  });

  it("conserves messages (produced = delivered + in-queue)", () => {
    const state = run({ producerRate: 7, consumerRate: 3 }, 6);
    expect(state.nextId).toBe(state.delivered + state.queue.length);
  });

  it("respects capacity (backpressure ceiling)", () => {
    const state = run({ producerRate: 20, consumerRate: 0, capacity: 10 }, 5);
    expect(state.queue.length).toBe(10);
  });

  it("flags backpressure when producer rate exceeds consumer rate", () => {
    expect(isBackpressured({ producerRate: 6, consumerRate: 3 })).toBe(true);
    expect(isBackpressured({ producerRate: 2, consumerRate: 3 })).toBe(false);
  });

  it("never consumes from an empty queue", () => {
    const state = run({ producerRate: 0, consumerRate: 10 }, 3);
    expect(state.queue.length).toBe(0);
    expect(state.delivered).toBe(0);
  });
});
