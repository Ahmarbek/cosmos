/**
 * Procedural planet surfaces.
 *
 * No photographic planet textures ship with this project, so every surface is
 * generated in the fragment shader from noise fields shaped per planet type:
 * cratered rock, layered cloud, wind-sheared bands, ice. One shader, switched
 * by uStyle, keeps the material count (and therefore the draw-call cost) low.
 */

export const planetVert = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vViewW;

  void main() {
    vObj = normalize(position);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vViewW = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const planetFrag = /* glsl */ `
  precision highp float;

  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vViewW;

  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uLightDir;     // world-space direction TOWARD the sun
  uniform vec3  uAtmo;
  uniform float uAtmoStrength;
  uniform float uTime;
  uniform int   uStyle;        // 0 cratered 1 clouded 2 terrestrial 3 desert 4 banded 5 ice
  uniform float uSeed;
  uniform float uSelected;

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
      f.z
    );
  }
  float fbm(vec3 p, int oct) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
      if (i >= oct) break;
      s += a * vnoise(p);
      p *= 2.04;
      a *= 0.5;
    }
    return s;
  }
  float ridge(vec3 p, int oct) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
      if (i >= oct) break;
      float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
      s += a * n * n;
      p *= 2.11;
      a *= 0.5;
    }
    return s;
  }

  // crater field: cell-centred rings, two scales
  float craters(vec3 p, float scale) {
    vec3 q = p * scale;
    vec3 id = floor(q);
    vec3 gv = fract(q) - 0.5;
    float acc = 0.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        for (int z = -1; z <= 1; z++) {
          vec3 o = vec3(float(x), float(y), float(z));
          float h = hash31(id + o + uSeed);
          if (h < 0.55) continue;
          vec3 c = o + vec3(hash31(id + o + 3.0), hash31(id + o + 7.0), hash31(id + o + 11.0)) - 0.5;
          float d = length(gv - c);
          float rad = 0.16 + h * 0.26;
          float rim = smoothstep(rad, rad * 0.72, d) - smoothstep(rad * 0.72, rad * 0.5, d) * 0.7;
          acc += rim * (0.4 + h * 0.6);
        }
      }
    }
    return acc;
  }

  void main() {
    vec3 p = vObj * 2.4 + uSeed;
    vec3 base;
    float rough = 1.0;

    if (uStyle == 0) {
      // cratered rock
      float n = fbm(p * 2.2, 5);
      float cr = craters(vObj, 4.2) * 0.5 + craters(vObj, 9.0) * 0.25;
      float shade = clamp(n * 0.7 + cr * 0.5, 0.0, 1.2);
      base = mix(uColorB, uColorA, shade);
      base *= 0.86 + 0.3 * fbm(p * 9.0, 3);
    } else if (uStyle == 1) {
      // thick layered cloud, sheared by latitude
      float lat = vObj.y;
      vec3 q = p;
      q.x += uTime * 0.012;
      float warp = fbm(q * 1.6, 4);
      float bands = sin(lat * 11.0 + warp * 5.5) * 0.5 + 0.5;
      float swirl = fbm(q * 3.4 + warp * 2.0, 4);
      base = mix(uColorB, uColorA, clamp(bands * 0.55 + swirl * 0.75, 0.0, 1.0));
      base = mix(base, vec3(1.0, 0.96, 0.86), pow(swirl, 3.0) * 0.5);
    } else if (uStyle == 3) {
      // dry, dust-storm world with polar frost
      float n = fbm(p * 2.6, 5);
      float r = ridge(p * 3.1, 4);
      base = mix(uColorB, uColorA, clamp(n * 1.1 + r * 0.35, 0.0, 1.0));
      float ice = smoothstep(0.86, 0.99, abs(vObj.y) + fbm(p * 6.0, 3) * 0.12);
      base = mix(base, vec3(0.92, 0.94, 0.98), ice * 0.85);
      float dust = fbm(vec3(p.xz * 4.0, uTime * 0.03), 3);
      base = mix(base, uColorA * 1.15, dust * 0.16);
    } else if (uStyle == 4) {
      // gas giant: zonal bands with turbulent shear between them
      float lat = vObj.y;
      float warp = fbm(vec3(p.x * 1.2, p.y * 4.0, p.z * 1.2) + uTime * 0.02, 4);
      float bands = sin(lat * 17.0 + warp * 3.2) * 0.5 + 0.5;
      float fine = fbm(vec3(p.x * 3.0, p.y * 14.0, p.z * 3.0) + uTime * 0.03, 4);
      float v = clamp(bands * 0.72 + fine * 0.42, 0.0, 1.0);
      base = mix(uColorB, uColorA, v);
      base = mix(base, vec3(1.0, 0.97, 0.9), pow(max(fine - 0.55, 0.0) * 2.0, 2.0) * 0.45);
      // one long-lived storm, if this body has been given one
      vec2 spot = vec2(atan(vObj.z, vObj.x) + uTime * 0.02, asin(clamp(vObj.y, -1.0, 1.0)));
      float sd = length(vec2(sin(spot.x - 1.1) * 1.9, spot.y + 0.34));
      float storm = smoothstep(0.34, 0.02, sd) * step(0.5, uSeed);
      base = mix(base, vec3(0.78, 0.3, 0.2), storm * 0.8);
    } else if (uStyle == 5) {
      // ice giant: nearly featureless, faint methane banding
      float lat = vObj.y;
      float warp = fbm(p * 1.4 + uTime * 0.01, 4);
      float bands = sin(lat * 9.0 + warp * 2.0) * 0.5 + 0.5;
      base = mix(uColorB, uColorA, clamp(bands * 0.4 + warp * 0.5 + 0.28, 0.0, 1.0));
      float streak = pow(max(fbm(vec3(p.x * 2.0, p.y * 9.0, p.z * 2.0), 3) - 0.55, 0.0) * 2.4, 2.0);
      base = mix(base, vec3(0.95, 0.99, 1.0), streak * 0.4);
      rough = 0.55;
    } else {
      float n = fbm(p * 2.4, 5);
      base = mix(uColorB, uColorA, n);
    }

    vec3 N = normalize(vNormalW);
    vec3 L = normalize(uLightDir);
    float ndl = dot(N, L);
    // widened terminator: planets do not have knife-edge day/night lines
    float diff = smoothstep(-0.18, 0.42, ndl);
    float ambient = 0.035;

    vec3 col = base * (diff + ambient);

    // specular sheen for smooth bodies
    vec3 H = normalize(L + vViewW);
    float spec = pow(max(dot(N, H), 0.0), mix(28.0, 90.0, 1.0 - rough)) * (1.0 - rough) * 0.5;
    col += vec3(1.0) * spec * diff;

    // atmospheric limb: forward-scattered light piling up at the edge
    float fres = pow(1.0 - max(dot(N, vViewW), 0.0), 3.0);
    float lit = smoothstep(-0.55, 0.6, ndl);
    col += uAtmo * fres * uAtmoStrength * lit * 1.25;

    // selection highlight
    col += uAtmo * fres * uSelected * 0.7;

    col = col / (col + vec3(1.1));
    col = pow(col, vec3(0.88));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;
