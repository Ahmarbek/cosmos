import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
 * plinth without anyone editing them first.
 */

const cache = new Map<string, Promise<THREE.Object3D | null>>();

function load(id: string): Promise<THREE.Object3D | null> {
  const hit = cache.get(id);
  if (hit) return hit;
  const p = new Promise<THREE.Object3D | null>((resolve) => {
    new GLTFLoader().load(
      `/models/${id}.glb`,
      (gltf) => resolve(gltf.scene),
      undefined,
      () => resolve(null)
    );
  });
  cache.set(id, p);
  return p;
}

interface Props {
  id: string;
  /** target height in world units; the model is scaled to match */
  height: number;
  children: React.ReactNode;
}

export default function CharacterModel({ id, height, children }: Props) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const holder = useRef<THREE.Group>(null);
  const box = useMemo(() => new THREE.Box3(), []);
  const size = useMemo(() => new THREE.Vector3(), []);
  const centre = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    let alive = true;
    load(id).then((scene) => {
      if (!alive || !scene) return;
      // SkeletonUtils, not Object3D.clone: a plain deep clone of a rigged
      // model leaves its SkinnedMeshes pointing at the original skeleton, and
      // the copy renders collapsed or not at all. Most downloadable character
      // models are rigged, so this is the common case, not the edge case.
      const obj = cloneSkinned(scene);
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
      obj.traverse((o) => {
        const sk = o as THREE.SkinnedMesh;
        if (!sk.isSkinnedMesh || !sk.skeleton) return;
        for (const j of sk.skeleton.bones) {
          j.getWorldPosition(bone);
          box.expandByPoint(bone);
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
      setModel(obj);
    });
    return () => {
      alive = false;
    };
  }, [id, height, box, size, centre]);

  useFrame(() => {
    // nothing to drive yet — the figure's float and facing are handled by the
    // parent group, so a supplied model inherits them unchanged
  });

  if (!model) return <>{children}</>;
  return <primitive ref={holder} object={model} />;
}
