/**
 * Pure enqueue/dequeue/rate logic for the Message Queue lesson.
 *
 * This is the first piece of pure, unit-tested logic in the project. Per the
 * spec it lives WITH the component (not in `src/lib/sim`, which stays empty
 * until phase 2). No React, no timers here — just a deterministic step function.
 */

export interface QueueMessage {
  id: number;
  label: string;
}

export interface QueueState {
  queue: QueueMessage[];
  /** The message currently being processed by the consumer (for display). */
  processing: QueueMessage | null;
  nextId: number;
  /** Fractional producer/consumer accumulators (rates are msgs/second). */
  produceAcc: number;
  consumeAcc: number;
  /** Total messages fully consumed. */
  delivered: number;
}

export interface QueueParams {
  /** Messages produced per second (sum of all producers). */
  producerRate: number;
  /** Messages consumed per second (sum of all consumers). */
  consumerRate: number;
  /** Optional cap on queue depth (backpressure); Infinity by default. */
  capacity?: number;
}

export function initialQueueState(depth0 = 0): QueueState {
  const queue: QueueMessage[] = [];
  for (let i = 0; i < depth0; i++) {
    queue.push({ id: i, label: `MSG ${i}` });
  }
  return {
    queue,
    processing: null,
    nextId: depth0,
    produceAcc: 0,
    consumeAcc: 0,
    delivered: 0,
  };
}

/**
 * Advance the simulation by `dt` seconds. Deterministic and side-effect free.
 * Producers enqueue at `producerRate`; the consumer dequeues (FIFO) at
 * `consumerRate`. The queue grows when producers outrun the consumer and drains
 * otherwise — the whole point of the lesson.
 */
export function tick(
  state: QueueState,
  params: QueueParams,
  dt: number,
): QueueState {
  const capacity = params.capacity ?? Infinity;
  const queue = state.queue.slice();
  let { nextId, delivered } = state;
  let produceAcc = state.produceAcc + params.producerRate * dt;
  let consumeAcc = state.consumeAcc + params.consumerRate * dt;

  // Enqueue whole messages accumulated this tick (respect capacity).
  while (produceAcc >= 1) {
    produceAcc -= 1;
    if (queue.length < capacity) {
      queue.push({ id: nextId, label: `MSG ${nextId}` });
      nextId += 1;
    }
  }

  // Dequeue whole messages the consumer can process this tick.
  let processing: QueueMessage | null = null;
  while (consumeAcc >= 1 && queue.length > 0) {
    consumeAcc -= 1;
    processing = queue.shift() ?? null;
    delivered += 1;
  }
  // If nothing was consumed this tick, keep showing the previous in-flight msg
  // only while the queue still has work; otherwise clear it.
  if (!processing && queue.length === 0) processing = null;
  else if (!processing) processing = state.processing;

  return { queue, processing, nextId, produceAcc, consumeAcc, delivered };
}

/** Arrival rate minus drain rate. Positive → backpressure building. */
export function isBackpressured(params: QueueParams): boolean {
  return params.producerRate > params.consumerRate;
}
