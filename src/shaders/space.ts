/**
 * Deep-space shaders: the starfield the camera flies through, drifting nebulae,
 * and distant galaxies.
 *
 * The starfield is one static buffer of points that wraps around the camera in
 * the vertex shader, so the field is effectively infinite and costs nothing per
 * frame on the CPU no matter how far the journey travels.
 */

export const starVert = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3  aTint;

  uniform vec3  uCamPos;
  uniform float uBox;        // wrap cell size
  uniform float uPixelRatio;
  uniform float uSizeScale;
  uniform float uTime;
  uniform float uWarp;       // scroll speed reaction

  varying float vFade;
  varying vec3  vTint;
  varying float vSeed;

  void main() {
    // wrap each star into the cell centred on the camera: an endless field
    vec3 rel = position - uCamPos;
    rel = mod(rel + uBox * 0.5, uBox) - uBox * 0.5;
    vec3 world = rel + uCamPos;

    vec4 mv = modelViewMatrix * vec4(world, 1.0);
    float dist = -mv.z;

    // fade in from the far plane and out as a star passes the lens
    float near = smoothstep(0.0, uBox * 0.035, dist);
    float far = 1.0 - smoothstep(uBox * 0.38, uBox * 0.5, dist);
    vFade = near * far;
    vTint = aTint;
    vSeed = aSeed;

    float twinkle = 0.78 + 0.22 * sin(uTime * (0.5 + aSeed * 2.0) + aSeed * 60.0);
    float size = aSize * uSizeScale * uPixelRatio * (1.0 + uWarp * 1.6) * twinkle;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(size / max(dist, 0.6), 0.6, 46.0);
  }
`;

export const starFrag = /* glsl */ `
  precision mediump float;
  varying float vFade;
  varying vec3  vTint;
  varying float vSeed;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    // tight core plus a wide, weak halo — reads as a point source, not a blob
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 3.2);
    float halo = smoothstep(0.5, 0.08, d) * 0.22;
    float a = (core + halo) * vFade * uOpacity;
    vec3 col = vTint * (0.85 + 0.5 * core);
    gl_FragColor = vec4(col, a);
    if (a < 0.004) discard;
    #include <colorspace_fragment>
  }
`;

export const nebulaVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nebulaFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uSeed;
  uniform float uDetail;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      s += a * noise(p);
      p = p * 2.07 + 3.1;
      a *= 0.5;
    }
    return s;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv) * 2.0;
    if (r > 1.0) discard;

    vec2 q = uv * uDetail + uSeed;
    // slow internal drift: two fbm fields advecting each other
    float warp = fbm(q * 0.8 + uTime * 0.012);
    float n = fbm(q + warp * 1.6 + vec2(uTime * 0.008, -uTime * 0.006));
    n = pow(max(n - 0.30, 0.0) * 1.5, 1.7);

    float falloff = pow(1.0 - r, 2.4);
    vec3 col = mix(uColorA, uColorB, clamp(warp, 0.0, 1.0));
    float a = n * falloff * uOpacity;
    gl_FragColor = vec4(col * a * 2.0, a);
    #include <colorspace_fragment>
  }
`;

/** A distant spiral galaxy, drawn procedurally on a single billboarded quad. */
export const galaxyFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3  uCore;
  uniform vec3  uArm;
  uniform float uSeed;
  uniform float uArms;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.11; a *= 0.5; }
    return s;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float r = length(uv);
    if (r > 1.0) discard;

    float ang = atan(uv.y, uv.x);
    // logarithmic spiral: arms tighten toward the core
    float spiral = sin(uArms * (ang + log(max(r, 0.04)) * 2.6) + uSeed + uTime * 0.02);
    float arm = pow(max(spiral, 0.0), 2.1);

    float dust = fbm(uv * 7.0 + uSeed);
    arm *= mix(0.45, 1.0, dust);

    float disk = exp(-r * 3.1);
    float core = exp(-r * r * 42.0);
    float bulge = exp(-r * 9.0) * 0.5;

    float v = arm * disk * 0.9 + core * 1.5 + bulge;
    v *= smoothstep(1.0, 0.55, r);

    vec3 col = mix(uArm, uCore, clamp(core * 2.0 + bulge, 0.0, 1.0));
    float a = clamp(v, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(col * a * 1.6, a);
    #include <colorspace_fragment>
  }
`;
