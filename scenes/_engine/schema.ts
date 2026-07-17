import { z } from "zod";

/**
 * Declarative 3D scene format v0.1 — see docs/SCENE_FORMAT.md.
 * The canonical format is JSON; the loader also accepts YAML and normalises it.
 * Keep this schema free of rendering-only concerns (it is the shared substrate
 * for the phase-2 simulation engine).
 */

export const NODE_TYPES = [
  "client",
  "load-balancer",
  "server",
  "service",
  "database",
  "cache",
  "queue",
  "cdn",
  "storage",
  "region",
] as const;

export const FLOW_TYPES = [
  "request",
  "response",
  "replication",
  "cache",
  "async",
  "data",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];
export type FlowType = (typeof FLOW_TYPES)[number];

const vec3 = z.tuple([z.number(), z.number(), z.number()]);

export const nodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(NODE_TYPES),
  label: z.string().min(1),
  count: z.number().int().positive().optional(),
  rank: z.number().int().nonnegative().optional(),
  position: vec3.optional(),
  group: z.string().optional(),
  description: z.string().optional(),
  accent: z.string().optional(),
  // Generic visual size multiplier. Added in v0.1 for lessons that emphasise a
  // single scaled-up component (e.g. vertical scaling). Not lesson-specific.
  scale: z.number().positive().optional(),
});

export const edgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  flow: z.enum(FLOW_TYPES).default("request"),
  animated: z.boolean().default(false),
  bidirectional: z.boolean().default(false),
});

const cameraSchema = z.object({
  position: vec3,
  target: vec3,
});

export const stepSchema = z.object({
  id: z.string().min(1),
  caption: z.string().min(1),
  highlight: z
    .object({
      nodes: z.array(z.string()).optional(),
      edges: z.array(z.string()).optional(),
    })
    .optional(),
  camera: cameraSchema.optional(),
});

export const layoutSchema = z.object({
  type: z.enum(["manual", "layered"]),
  direction: z.enum(["x", "y", "z"]).default("x"),
  spacing: z.number().positive().default(3),
});

export const sceneSchema = z.object({
  version: z.literal("0.1"),
  meta: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
  }),
  layout: layoutSchema,
  nodes: z.array(nodeSchema).min(1),
  edges: z.array(edgeSchema).default([]),
  steps: z.array(stepSchema).optional(),
  camera: cameraSchema.optional(),
});

export type SceneNode = z.infer<typeof nodeSchema>;
export type SceneEdge = z.infer<typeof edgeSchema>;
export type SceneStep = z.infer<typeof stepSchema>;
export type SceneCamera = z.infer<typeof cameraSchema>;
export type Scene = z.infer<typeof sceneSchema>;
