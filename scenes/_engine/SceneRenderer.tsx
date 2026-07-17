"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

import type { Scene, SceneCamera } from "./schema";
import { computeLayout, type Vec3 } from "./layout";
import { nodeKit, flowStyle } from "./nodeKit";

export interface SceneRendererProps {
  scene: Scene;
  /** Index into `scene.steps`; drives highlight + camera. Undefined = show all. */
  activeStep?: number;
  /** When true, disables autoplay/particles and holds the camera (a11y). */
  reducedMotion?: boolean;
}

const DEFAULT_CAMERA: SceneCamera = {
  position: [9, 6, 13],
  target: [2, 0, 0],
};

// Semantic accent token names → hex (SCENE_FORMAT: accent is a token, not raw hex).
const ACCENT_TOKENS: Record<string, string> = {
  emerald: "#00E28A",
  blue: "#5B8CFF",
  purple: "#B48BFF",
  yellow: "#FFD24D",
  orange: "#FFB84D",
  red: "#FF5A6A",
  neutral: "#B8BFCC",
};

function resolveColor(accent: string | undefined, fallback: string): string {
  if (!accent) return fallback;
  if (ACCENT_TOKENS[accent]) return ACCENT_TOKENS[accent]!;
  if (/^#[0-9a-fA-F]{3,8}$/.test(accent)) return accent;
  return fallback;
}

function fanPairs(from: Vec3[], to: Vec3[]): [Vec3, Vec3][] {
  const n = Math.max(from.length, to.length);
  const pairs: [Vec3, Vec3][] = [];
  for (let i = 0; i < n; i++) {
    const f = from[i % from.length];
    const t = to[i % to.length];
    if (f && t) pairs.push([f, t]);
  }
  return pairs;
}

export function SceneRenderer({
  scene,
  activeStep,
  reducedMotion = false,
}: SceneRendererProps) {
  const layout = useMemo(() => computeLayout(scene), [scene]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const step =
    activeStep != null && scene.steps ? scene.steps[activeStep] : undefined;
  const highlightNodes = step?.highlight?.nodes;
  const highlightEdges = step?.highlight?.edges;
  const hasHighlight = Boolean(highlightNodes || highlightEdges);

  const desiredCamera = step?.camera ?? scene.camera ?? DEFAULT_CAMERA;

  const flowsInScene = useMemo(() => {
    const set = new Set(scene.edges.map((e) => e.flow));
    return [...set];
  }, [scene.edges]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: scene.camera?.position ?? DEFAULT_CAMERA.position, fov: 45 }}
        onPointerMissed={() => setSelectedId(null)}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 10, 8]} intensity={1.1} />
        <directionalLight position={[-8, 4, -6]} intensity={0.3} color="#5B8CFF" />

        <Grid
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#161a1f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#262b34"
          position={[0, -1.6, 0]}
          fadeDistance={40}
          fadeStrength={1.5}
          infiniteGrid
        />

        {scene.nodes.map((node) => {
          const l = layout.get(node.id);
          if (!l) return null;
          const entry = nodeKit[node.type];
          const dimmed = hasHighlight && !highlightNodes?.includes(node.id);
          const color = resolveColor(node.accent, entry.color);
          return (
            <NodeView
              key={node.id}
              nodeId={node.id}
              label={node.label}
              description={node.description}
              instances={l.instances}
              center={l.center}
              color={color}
              labelY={entry.labelY}
              scale={node.scale ?? 1}
              container={entry.container ?? false}
              geometry={entry.geometry}
              dimmed={dimmed}
              highlighted={hasHighlight && !dimmed}
              selected={selectedId === node.id}
              onSelect={() =>
                setSelectedId((cur) => (cur === node.id ? null : node.id))
              }
            />
          );
        })}

        {scene.edges.map((edge) => {
          const from = layout.get(edge.from);
          const to = layout.get(edge.to);
          if (!from || !to) return null;
          const dimmed = hasHighlight && !highlightEdges?.includes(edge.id);
          const style = flowStyle[edge.flow];
          const pairs = fanPairs(from.instances, to.instances);
          return (
            <EdgeView
              key={edge.id}
              pairs={pairs}
              color={style.color}
              dimmed={dimmed}
              animated={edge.animated && !reducedMotion && !dimmed}
            />
          );
        })}

        <CameraRig target={desiredCamera} snap={reducedMotion} />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.12}
          minDistance={6}
          maxDistance={26}
          maxPolarAngle={Math.PI * 0.52}
        />
      </Canvas>

      <FlowLegend flows={flowsInScene} />

      <p className="pointer-events-none absolute right-3 top-3 rounded-md border border-border-2 bg-surface-2/80 px-2 py-1 font-mono text-[10px] text-muted-fg backdrop-blur">
        drag · pinch · tap a node
      </p>
    </div>
  );
}

interface NodeViewProps {
  nodeId: string;
  label: string;
  description?: string;
  instances: Vec3[];
  center: Vec3;
  color: string;
  labelY: number;
  scale: number;
  container: boolean;
  geometry: () => React.ReactElement;
  dimmed: boolean;
  highlighted: boolean;
  selected: boolean;
  onSelect: () => void;
}

function NodeView(props: NodeViewProps) {
  const {
    label,
    description,
    instances,
    center,
    color,
    labelY,
    scale,
    container,
    geometry,
    dimmed,
    highlighted,
    selected,
    onSelect,
  } = props;

  const opacity = dimmed ? 0.14 : container ? 0.4 : 1;
  const emissiveIntensity = dimmed ? 0.05 : highlighted || selected ? 0.9 : 0.35;

  const material = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={emissiveIntensity}
      transparent
      opacity={opacity}
      metalness={0.1}
      roughness={0.45}
    />
  );

  const isFleet = instances.length > 1;

  return (
    <group>
      {isFleet ? (
        <InstancedNode
          instances={instances}
          scale={scale}
          geometry={geometry}
          material={material}
          onSelect={onSelect}
        />
      ) : (
        <mesh
          position={instances[0] ?? center}
          scale={scale}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {geometry()}
          {material}
        </mesh>
      )}

      {/* Label is always present (never an anonymous shape). */}
      <Html
        position={[center[0], center[1] + labelY * scale + 0.35, center[2]]}
        center
        distanceFactor={12}
        style={{ pointerEvents: "none" }}
      >
        <span
          className="whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-text-2"
          style={{ opacity: dimmed ? 0.5 : 1 }}
        >
          {label}
          {isFleet ? ` ×${instances.length}` : ""}
        </span>
      </Html>

      {selected && description && (
        <Html
          position={[center[0], center[1] - 0.2, center[2]]}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
        >
          <div className="w-52 -translate-y-full rounded-lg border border-border-2 bg-surface-2/95 p-3 text-left shadow-lg backdrop-blur">
            <p className="font-mono text-[11px] font-semibold text-emerald">
              {label}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-text-2">
              {description}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

interface InstancedNodeProps {
  instances: Vec3[];
  scale: number;
  geometry: () => React.ReactElement;
  material: React.ReactElement;
  onSelect: () => void;
}

function InstancedNode({
  instances,
  scale,
  geometry,
  material,
  onSelect,
}: InstancedNodeProps) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    instances.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.count = instances.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [instances, scale]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, instances.length]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {geometry()}
      {material}
    </instancedMesh>
  );
}

interface EdgeViewProps {
  pairs: [Vec3, Vec3][];
  color: string;
  dimmed: boolean;
  animated: boolean;
}

function EdgeView({ pairs, color, dimmed, animated }: EdgeViewProps) {
  return (
    <group>
      {pairs.map(([a, b], i) => (
        <group key={i}>
          <Line
            points={[a, b]}
            color={color}
            lineWidth={dimmed ? 1 : 2}
            transparent
            opacity={dimmed ? 0.18 : 0.75}
          />
          {animated ? (
            <FlowParticle a={a} b={b} color={color} phase={i * 0.37} />
          ) : (
            // Reduced-motion / static: a labeled dot parked at the source end.
            !dimmed && (
              <mesh position={a}>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshBasicMaterial color={color} />
              </mesh>
            )
          )}
        </group>
      ))}
    </group>
  );
}

interface FlowParticleProps {
  a: Vec3;
  b: Vec3;
  color: string;
  phase: number;
}

function FlowParticle({ a, b, color, phase }: FlowParticleProps) {
  const ref = useRef<THREE.Mesh>(null);
  const start = useMemo(() => new THREE.Vector3(a[0], a[1], a[2]), [a]);
  const end = useMemo(() => new THREE.Vector3(b[0], b[1], b[2]), [b]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = ((state.clock.elapsedTime * 0.7 + phase) % 1 + 1) % 1;
    mesh.position.lerpVectors(start, end, t);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    // Fade in over the last 30% of the trip (design §8 request pulse).
    mat.opacity = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.11, 12, 12]} />
      <meshBasicMaterial color={color} transparent />
    </mesh>
  );
}

function CameraRig({ target, snap }: { target: SceneCamera; snap: boolean }) {
  const desiredPos = useMemo(
    () => new THREE.Vector3(...target.position),
    [target.position],
  );
  const desiredTarget = useMemo(
    () => new THREE.Vector3(...target.target),
    [target.target],
  );

  useFrame((state) => {
    // OrbitControls (makeDefault) registers itself on state.controls.
    const controls = state.controls as unknown as
      | { target: THREE.Vector3; update: () => void }
      | null;
    const alpha = snap ? 1 : 0.06;
    state.camera.position.lerp(desiredPos, alpha);
    if (controls?.target) {
      controls.target.lerp(desiredTarget, alpha);
      controls.update();
    }
  });

  return null;
}

function FlowLegend({ flows }: { flows: (keyof typeof flowStyle)[] }) {
  if (flows.length === 0) return null;
  return (
    <ul className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 rounded-md border border-border-2 bg-surface-2/80 px-2.5 py-2 backdrop-blur">
      {flows.map((flow) => {
        const s = flowStyle[flow];
        return (
          <li
            key={flow}
            className="flex items-center gap-2 font-mono text-[10px] text-text-2"
          >
            <span aria-hidden style={{ color: s.color }}>
              {s.glyph}
            </span>
            <span>{s.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default SceneRenderer;
