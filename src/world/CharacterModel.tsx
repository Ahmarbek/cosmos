import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useFrame } from '@react-three/fiber';

/**
 * A supplied 3D model, if there is one.
 *
 * Drop a file at /public/models/<character-id>.glb and the hall uses it in
 * place of the procedural figure. This is the route to real likenesses: an
 * exact model of a person comes from a photogrammetry scan or a character
 * artist, so the honest thing for the code to do is make that drop-in
 * effortless rather than pretend it can generate one.
 *
 * The model is normalised on load — recentred on its feet and scaled to the
 * character's height — so assets from different sources stand correctly on the
 * plinth without anyone editing them first. If it carries an idle clip that
 * clip is played, because a figure with a pulse reads as present in a way a
 * frozen bind pose never does.
 */

/**
 * One loader for the whole hall, with both mesh compressions wired up.
 *
 * A likeness at a useful polygon count is several megabytes raw, and which of
 * the two ways of getting it under budget was used — Draco or meshopt — is
 * decided by whoever exported the file, not by us. Supporting neither means
 * the drop-in promise quietly fails on a good half of the assets people
 * actually have. The Draco decoder is served from /draco rather than a CDN so
 * the hall still works offline, and it is fetched only if a Draco-compressed
 * file turns up.
 */
const loader = new GLTFLoader()
  .setDRACOLoader(new DRACOLoader().setDecoderPath('/draco/'))
  .setMeshoptDecoder(MeshoptDecoder);

interface Asset {
  scene: THREE.Object3D;
  clips: THREE.AnimationClip[];
}

const cache = new Map<string, Promise<Asset | null>>();

function load(id: string): Promise<Asset | null> {
  const hit = cache.get(id);
  if (hit) return hit;
  const p = new Promise<Asset | null>((resolve) => {
    loader.load(
      `/models/${id}.glb`,
      (gltf) => resolve({ scene: gltf.scene, clips: gltf.animations ?? [] }),
      undefined,
      () => resolve(null)
    );
  });
  cache.set(id, p);
  return p;
}

/**
 * The clip to stand there doing, out of whatever the file happens to ship.
 *
 * An idle is what a figure on a plinth wants, and its name is the only thing
 * that distinguishes one, so names are read first; the first clip is the
 * fallback for the files that ship a single unhelpfully named animation.
 */
function idleClip(clips: THREE.AnimationClip[]): THREE.AnimationClip | null {
  if (!clips.length) return null;
  return clips.find((c) => /idle|breath|stand|pose/i.test(c.name)) ?? clips[0];
}

/**
 * The same clip with the root's translation dropped.
 *
 * The plinth is 1.2 m across, and a model may well arrive with a walk as its
 * only animation: played as authored it carries the figure off the front
 * within a couple of seconds and then keeps going. Removing the position track
 * on the root bone leaves the motion of every limb intact and pins the figure
 * where it was put, which is what an exhibit needs from any clip at all.
 */
function inPlace(clip: THREE.AnimationClip, root: string | null): THREE.AnimationClip {
  if (!root) return clip;
  const c = clip.clone();
  c.tracks = c.tracks.filter((t) => t.name !== `${root}.position`);
  return c;
}

interface Props {
  id: string;
  /** target height in world units; the model is scaled to match */
  height: number;
  /** play the model's idle clip; off on the low tier, where skinning costs most */
  animate?: boolean;
  children: React.ReactNode;
}

export default function CharacterModel({ id, height, animate = true, children }: Props) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const holder = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  // A figure with no clip of its own still has to look alive; see breathe().
  const breath = useRef<number>(Math.random() * Math.PI * 2);
  const rigged = useRef(false);
  const box = useMemo(() => new THREE.Box3(), []);
  const size = useMemo(() => new THREE.Vector3(), []);
  const centre = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    let alive = true;
    load(id).then((asset) => {
      if (!alive || !asset) return;
      // SkeletonUtils, not Object3D.clone: a plain deep clone of a rigged
      // model leaves its SkinnedMeshes pointing at the original skeleton, and
      // the copy renders collapsed or not at all. Most downloadable character
      // models are rigged, so this is the common case, not the edge case.
      const obj = cloneSkinned(asset.scene);
      // Normalise: measure, scale to the target height, sit it on y = 0.
      //
      // Box3.setFromObject measures a SkinnedMesh from its undeformed geometry,
      // which on a rigged character bears no relation to the posed figure — it
      // reported a third of a metre for a man. So the skeleton is measured too:
      // bone world positions do describe the pose, and the union of the two is
      // right for both static props and rigged people.
      obj.updateMatrixWorld(true);
      box.setFromObject(obj);
      const bone = new THREE.Vector3();
      // The topmost bone of the first skeleton: the one a root-motion track
      // drives, and so the one to pin down before any clip is played.
      let root: string | null = null;
      obj.traverse((o) => {
        const sk = o as THREE.SkinnedMesh;
        if (!sk.isSkinnedMesh || !sk.skeleton) return;
        for (const j of sk.skeleton.bones) {
          j.getWorldPosition(bone);
          box.expandByPoint(bone);
          if (root === null && !(j.parent as THREE.Bone | null)?.isBone) root = j.name;
        }
      });
      box.getSize(size);
      box.getCenter(centre);
      // a measurement this far from human is a measurement that failed
      const usable = size.y > 0.15 && size.y < 500;
      const s = usable ? height / size.y : 1;
      if (!usable) {
        console.warn(
          `[cosmos] could not measure /models/${id}.glb (height read as ${size.y.toFixed(3)}). ` +
            'Using it at its authored scale — export it roughly human-sized and Y-up.'
        );
      }
      obj.scale.setScalar(s);
      obj.position.set(usable ? -centre.x * s : 0, usable ? -box.min.y * s : 0, usable ? -centre.z * s : 0);
      let tris = 0;
      obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.castShadow = false;
        m.receiveShadow = false;
        const g = m.geometry as THREE.BufferGeometry;
        tris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
        // The hall is deliberately near-lightless — the procedural figures
        // carry their own shader. A supplied model arrives with PBR materials
        // and nothing to catch, so it renders black. Making it self-lit from
        // its own texture both fixes that and matches the projection language
        // of everything else on the plinths.
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        for (const raw of mats) {
          const mat = raw as THREE.MeshStandardMaterial;
          if (!mat) continue;
          if ('envMapIntensity' in mat) mat.envMapIntensity = 0.6;
          if ('emissive' in mat && mat.emissive) {
            mat.emissive = new THREE.Color(0xffffff);
            mat.emissiveIntensity = 0.62;
            if (mat.map) mat.emissiveMap = mat.map;
            mat.needsUpdate = true;
          }
        }
      });

      // Scan-derived models are routinely in the millions of triangles, which
      // a browser will load and then choke on. Say so rather than let the hall
      // quietly drop to single figures per second.
      if (tris > 180000) {
        console.warn(
          `[cosmos] /models/${id}.glb has ~${Math.round(tris / 1000)}k triangles. ` +
            'Decimate it to under ~80k (Blender: Decimate modifier, or gltf-transform simplify) ' +
            'or the world will not hold frame rate.'
        );
      }

      // The clips hang off the glTF, not off the scene graph, so a clone that
      // copies only the scene — which is every clone made here — arrives
      // frozen in its bind pose unless a mixer is attached to it by hand.
      const clip = animate ? idleClip(asset.clips) : null;
      rigged.current = clip !== null;
      if (clip) {
        const m = new THREE.AnimationMixer(obj);
        m.clipAction(inPlace(clip, root)).play();
        // Ten figures started together would breathe in lockstep, which reads
        // as one machine rather than as ten people; an offset breaks that up.
        m.setTime(Math.random() * clip.duration);
        mixer.current = m;
      }
      setModel(obj);
    });
    return () => {
      alive = false;
      mixer.current?.stopAllAction();
      mixer.current = null;
    };
  }, [id, height, animate, box, size, centre]);

  useFrame((_, dt) => {
    // The float and the facing are the parent group's, and a supplied model
    // inherits them unchanged. Its own clip is driven from here.
    mixer.current?.update(dt);

    // Breathing, for the models that arrive without a skeleton.
    //
    // An image-to-3D mesh is geometry and nothing else: no bones, so no clip,
    // so the figure stands in a dead stillness that reads as a shop dummy
    // rather than a person. There is no rig to drive, but a body at rest is
    // not motionless — the chest rises, and weight shifts slowly from one
    // foot to the other. Both of those are whole-body transforms, so both can
    // be faked on the holder without any skinning at all: a shallow vertical
    // scale about the feet for the breath, a long sway on top of it. It costs
    // two sin() per figure per frame and no vertex work, which matters here
    // because ten of these stand in one room.
    //
    // This is deliberately not a substitute for a rig. Arms and head stay
    // still, and up close it reads as what it is. It is what an un-rigged
    // mesh can honestly do until a real idle clip replaces it.
    const h = holder.current;
    if (!h || !animate || rigged.current) return;
    breath.current += dt;
    const t = breath.current;
    // ~14 breaths a minute, and a sway far slower so the two never beat
    // together into a visible pulse.
    const rise = Math.sin(t * 1.45);
    const sway = Math.sin(t * 0.31);
    h.scale.set(1 - rise * 0.0045, 1 + rise * 0.009, 1 - rise * 0.0045);
    h.rotation.z = sway * 0.012;
    h.position.x = sway * 0.011;
  });

  if (!model) return <>{children}</>;
  // The model keeps its own normalising transform; the idle is applied to a
  // wrapper so the two never fight over position and scale.
  return (
    <group ref={holder}>
      <primitive object={model} />
    </group>
  );
}
