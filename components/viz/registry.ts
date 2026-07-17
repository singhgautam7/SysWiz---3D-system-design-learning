import type { ComponentType } from "react";
import { MessageQueueViz } from "@/components/MessageQueueViz";

/**
 * Maps a lesson's `componentRef` (2D dimension) to its React component.
 * A 2D lesson names its widget here; the lesson route looks it up.
 */
export const VIZ_REGISTRY: Record<string, ComponentType> = {
  MessageQueueViz,
};
