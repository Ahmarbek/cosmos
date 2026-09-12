/** The Sun, planetary atmosphere shells, and Saturn's rings. */

export const sunFrag = /* glsl */ `
  precision highp float;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  uniform float uTime;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p *= 2.07; a *= 0.5; }
    return s;
  }

  void main() {
    vec3 p = vObj * 3.2;
    // granulation drifting over a slower convective field
    float slow = fbm(p * 1.1 + vec3(0.0, uTime * 0.03, 0.0));
    float gran = fbm(p * 5.5 + slow * 2.0 + uTime * 0.07);
    float v = clamp(slow * 0.6 + gran * 0.7, 0.0, 1.4);

    vec3 deep = vec3(1.0, 0.42, 0.08);
    vec3 mid  = vec3(1.0, 0.72, 0.26);
    vec3 hot  = vec3(1.0, 0.97, 0.88);
    vec3 col = mix(deep, mid, smoothstep(0.25, 0.65, v));
    col = mix(col, hot, smoothstep(0.6, 1.05, v));

    // limb darkening
    float mu = max(dot(normalize(vNormalW), normalize(vViewW)), 0.0);
    col *= 0.55 + 0.65 * pow(mu, 0.55);
    col += vec3(1.0, 0.55, 0.2) * pow(1.0 - mu, 3.0) * 0.6;

    gl_FragColor = vec4(col * 1.55, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Additive corona, drawn on a camera-facing quad behind the star. */
export const coronaFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3  uColor;

  float hash(vec2 p) { p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 34.2); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.1; a *= 0.5; } return s; }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float r = length(uv);
    if (r > 1.0) discard;
    float ang = atan(uv.y, uv.x);
    // ray-like streamers, slowly turning
    float streamer = fbm(vec2(ang * 3.4, r * 2.2 - uTime * 0.06));
    float glow = pow(max(1.0 - r, 0.0), 2.6);
    float inner = pow(max(1.0 - r, 0.0), 8.0) * 1.6;
    float a = (glow * (0.45 + streamer * 0.75) + inner) * uOpacity;
    gl_FragColor = vec4(uColor * a * 1.8, a);
    #include <colorspace_fragment>
  }
`;

/** Atmosphere shell — rendered on a slightly larger back-faced sphere. */
export const atmosphereVert = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vWorld;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export const atmosphereFrag = /* glsl */ `
  precision mediump float;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  uniform vec3  uColor;
  uniform vec3  uLightDir;
  uniform float uStrength;
  uniform float uPower;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(N, V), 0.0), uPower);
    float ndl = dot(N, normalize(uLightDir));
    // scattering piles up on the lit limb and dies quickly on the night side
    float lit = smoothstep(-0.45, 0.55, ndl);
    float forward = pow(max(dot(normalize(uLightDir), -V), 0.0), 2.0) * 0.6;
    float a = fres * uStrength * (lit * 0.9 + forward * lit + 0.04);
    gl_FragColor = vec4(uColor * a * 1.7, a);
    #include <colorspace_fragment>
  }
`;

export const ringFrag = /* glsl */ `
  // highp, to match the vertex stage: uInner and uOuter are declared in both,
  // and a precision mismatch on a shared uniform fails program linking outright
  precision highp float;
  varying vec2 vUv;
  varying vec3 vWorld;
  uniform vec3  uColor;
  uniform vec3  uLightDir;
  uniform vec3  uCenter;
  uniform float uPlanetRadius;
  uniform float uInner;
  uniform float uOuter;

  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float bandNoise(float x) {
    float i = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), f);
  }

  void main() {
    // vUv.x carries normalised radius across the annulus
    float t = vUv.x;
    float r = mix(uInner, uOuter, t);

    // concentric structure at several scales, plus a Cassini-style gap
    float d = 0.55 + 0.45 * bandNoise(t * 46.0);
    d *= 0.65 + 0.5 * bandNoise(t * 17.0 + 3.7);
    d *= 0.8 + 0.35 * bandNoise(t * 128.0 + 9.1);
    d *= 1.0 - smoothstep(0.40, 0.455, t) * (1.0 - smoothstep(0.50, 0.56, t)) * 0.92;
    d *= smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.9, 1.0, t));

    // planet shadow: is this ring particle behind the sphere from the Sun?
    vec3 rel = vWorld - uCenter;
    vec3 L = normalize(uLightDir);
    float along = dot(rel, L);
    float perp = length(rel - L * along);
    float shadow = 1.0;
    if (along < 0.0) shadow = smoothstep(uPlanetRadius * 0.92, uPlanetRadius * 1.35, perp);

    vec3 col = uColor * mix(0.75, 1.15, bandNoise(t * 23.0));
    float a = clamp(d, 0.0, 1.0) * 0.82;
    col *= mix(0.22, 1.0, shadow);
    gl_FragColor = vec4(col * a, a * (0.35 + 0.65 * shadow));
    #include <colorspace_fragment>
  }
`;

/** Plain UV pass-through for billboarded quads (corona, nebula, galaxy). */
export const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * RingGeometry's own UVs are a planar projection, which is useless for radial
 * banding — so the normalised radius is recomputed here and passed as vUv.x.
 */
export const ringVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  uniform float uInner;
  uniform float uOuter;
  void main() {
    float r = length(position.xy);
    vUv = vec2((r - uInner) / max(uOuter - uInner, 0.0001), 0.0);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
