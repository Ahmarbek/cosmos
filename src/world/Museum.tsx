import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial, Stars } from '@react-three/drei';
import { ARENA_RADIUS, STATIONS } from './worldLayout';
import { makeLabelTexture } from '../utils/labelTexture';
import { useT } from '../i18n';
import type { Quality } from '../state/useStore';
import { mulberry32 } from '../utils/noise';

/**
 * The hall: a floating rotunda with ten alcoves, open to the stars.
 *
 * The floor is a real planar reflection on anything but the low tier — it does
 * more for the sense of a physical place than any amount of extra geometry, so
 * it is the one expensive thing in the budget.
 */

const wallVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const wallFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3  uColor;

  void main() {
    // vertical ribs, with a slow travelling pulse
    float ribs = abs(sin(vUv.x * 220.0));
    ribs = smoothstep(0.86, 1.0, ribs);
    float pulse = 0.5 + 0.5 * sin(vUv.x * 18.0 - uTime * 0.35);
    float vfade = smoothstep(1.0, 0.18, vUv.y) * smoothstep(0.0, 0.06, vUv.y);
    float a = (ribs * 0.5 * (0.4 + pulse * 0.6) + 0.035) * vfade;
    gl_FragColor = vec4(uColor * a * 1.6, a);
    #include <colorspace_fragment>
  }
`;

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const rand = mulberry32(88);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * ARENA_RADIUS;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = rand() * 16;
      p[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.055}
        color="#9fb6ff"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Centrepiece() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.06;
  });
  return (
    <group position={[0, 5.5, 0]}>
      <group ref={g}>
        {[
          [0, 0, 0],
          [Math.PI / 2.6, 0.4, 0],
          [0.5, 1.2, Math.PI / 3],
        ].map((r, i) => (
          <mesh key={i} rotation={r as [number, number, number]}>
            <torusGeometry args={[3.4 - i * 0.45, 0.025, 8, 96]} />
            <meshBasicMaterial color={i === 1 ? '#7C5CFF' : '#5BC8FF'} transparent opacity={0.75} />
          </mesh>
        ))}
        <mesh>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshBasicMaterial color="#EAEAF2" wireframe transparent opacity={0.35} />
        </mesh>
      </group>
      <pointLight color="#9ab0ff" intensity={90} distance={150} decay={1.7} />
    </group>
  );
}

/**
 * The ten alcoves are identical except for their plate and their colour, so
 * the parts that do not vary are built once and shared. Ten copies of the same
 * standard material are ten more programs to look up and ten more uniform
 * uploads per frame for no difference on screen.
 */
const MONOLITH_GEO = new THREE.BoxGeometry(7.2, 15, 0.7);
const MONOLITH_MAT = new THREE.MeshStandardMaterial({
  color: '#0d0f16',
  metalness: 0.82,
  roughness: 0.38,
});
const SEAM_GEO = new THREE.PlaneGeometry(0.07, 13);
const INLAY_GEO = new THREE.PlaneGeometry(0.05, 11);
const NUMERAL_GEO = new THREE.PlaneGeometry(3.2, 1.6);
const RING_MAT = new THREE.MeshBasicMaterial({
  color: '#8fb0ff',
  transparent: true,
  opacity: 0.34,
  side: THREE.DoubleSide,
  depthWrite: false,
});

/** One pair per palette colour, rather than one pair per alcove. */
const seamMats = new Map<string, THREE.MeshBasicMaterial>();
function seamMaterial(colour: string) {
  let m = seamMats.get(colour);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.38 });
    seamMats.set(colour, m);
  }
  return m;
}

const inlayMats = new Map<string, THREE.MeshBasicMaterial>();
function inlayMaterial(colour: string) {
  let m = inlayMats.get(colour);
  if (!m) {
    m = new THREE.MeshBasicMaterial({
      color: colour,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    inlayMats.set(colour, m);
  }
  return m;
}

function Alcove({ station, index }: { station: (typeof STATIONS)[number]; index: number }) {
  const t = useT();
  // Baked to a canvas, so it is rebuilt — and the old one released — whenever
  // the language changes.
  const discipline = t(station.discipline);
  const plate = useMemo(
    () =>
      makeLabelTexture({
        text: String(index + 1).padStart(2, '0'),
        sub: discipline.slice(0, 34),
        width: 512,
        height: 256,
      }),
    [index, discipline]
  );
  useEffect(() => () => plate.dispose(), [plate]);

  const seam = seamMaterial(station.palette[0]);
  const inlay = inlayMaterial(station.palette[0]);

  return (
    <group position={[station.position.x * 1.24, 0, station.position.z * 1.24]} rotation={[0, station.facing, 0]}>
      {/* monolith */}
      <mesh position={[0, 7.5, 0]} geometry={MONOLITH_GEO} material={MONOLITH_MAT} />
      {/* Lit seams, paired off-centre. A single central seam runs straight down
          behind whoever is standing on the plinth and cuts the figure in half. */}
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 7.5, 0.38]} geometry={SEAM_GEO} material={seam} />
      ))}
      {/* numeral */}
      <mesh position={[0, 12.4, 0.38]} geometry={NUMERAL_GEO}>
        <meshBasicMaterial map={plate} transparent depthWrite={false} opacity={0.6} />
      </mesh>
      {/* floor inlay leading to the plinth — a pair of hairlines rather than a
          painted slab, which at this scale reads as architecture, not decal */}
      {[-1.1, 1.1].map((x) => (
        <mesh
          key={x}
          position={[x, 0.012, 5]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={INLAY_GEO}
          material={inlay}
        />
      ))}
    </group>
  );
}

export default function Museum({ quality }: { quality: Quality }) {
  const wallMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: wallVert,
        fragmentShader: wallFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#6f8cff') } },
      }),
    []
  );

  useFrame((_, dt) => {
    wallMat.uniforms.uTime.value += dt;
  });

  return (
    <group>
      <ambientLight intensity={0.42} color="#8ea4ff" />
      <hemisphereLight args={['#7d95ff', '#0c0c16', 0.95]} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[ARENA_RADIUS, 96]} />
        {quality === 'low' ? (
          <meshStandardMaterial color="#0a0b11" metalness={0.9} roughness={0.28} />
        ) : (
          /* The reflection is a second full render of the hall every frame, so
             its resolution is the single most expensive number in the world.
             It is also the least visible one: the result is blurred hard and
             mixed at low strength, and halving it is not something you can see
             on the floor — where doubling it is something you can feel in the
             frame time. */
          <MeshReflectorMaterial
            resolution={quality === 'high' ? 512 : 256}
            mixBlur={0.85}
            mixStrength={7}
            blur={quality === 'high' ? [200, 60] : [140, 45]}
            mirror={0.9}
            depthScale={1.05}
            minDepthThreshold={0.5}
            maxDepthThreshold={1.3}
            color="#06070c"
            metalness={0.86}
            roughness={0.42}
          />
        )}
      </mesh>

      {/* concentric floor rings */}
      {[10, 20, 30, 42].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={RING_MAT}>
          <ringGeometry args={[r, r + 0.035, 128]} />
        </mesh>
      ))}

      {/* outer wall */}
      <mesh material={wallMat} position={[0, 11, 0]}>
        <cylinderGeometry args={[ARENA_RADIUS + 1, ARENA_RADIUS + 1, 22, 64, 1, true]} />
      </mesh>

      <Centrepiece />
      <Dust count={quality === 'high' ? 900 : 400} />
      <Stars radius={180} depth={90} count={quality === 'high' ? 3500 : 1600} factor={4} saturation={0} fade speed={0.4} />

      {STATIONS.map((s, i) => (
        <Alcove key={s.id} station={s} index={i} />
      ))}
    </group>
  );
}
