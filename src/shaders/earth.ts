/**
 * Earth.
 *
 * Day colour, night lights, cloud deck and ocean specular are read from
 * canvas-generated textures (see utils/earthTextures.ts) rather than from
 * photographs, so the project ships with no image dependencies. If real NASA
 * imagery is dropped into /public/textures the loader picks it up instead.
 */

export const earthVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export const earthFrag = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorld;

  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uClouds;
  uniform sampler2D uMask;
  uniform vec3  uLightDir;
  uniform float uTime;
  uniform float uCloudOpacity;
  uniform float uNightLights;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);
    vec3 L = normalize(uLightDir);
    float ndl = dot(N, L);

    vec3 day = texture2D(uDay, vUv).rgb;
    float ocean = texture2D(uMask, vUv).r;   // 1 = open water, 0 = land or ice

    // Clouds drift a little faster than the surface turns. No fract() here:
    // the texture already repeats in x, and wrapping the coordinate by hand
    // puts a discontinuity in the UV derivative that shows up as a hard mipmap
    // seam down the antimeridian.
    vec2 cuv = vec2(vUv.x + uTime * 0.0035, vUv.y);
    float cloud = texture2D(uClouds, cuv).r * uCloudOpacity;

    // twilight band: warm, and wider than a hard terminator
    float dayAmt = smoothstep(-0.12, 0.30, ndl);
    float twilight = smoothstep(-0.25, 0.02, ndl) * (1.0 - smoothstep(0.0, 0.30, ndl));

    vec3 col = day * dayAmt;
    col = mix(col, col * vec3(1.25, 0.78, 0.55), twilight * 0.65);

    // specular glint, water only, and never through cloud
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 230.0) * ocean * dayAmt * (1.0 - cloud);
    col += vec3(1.0, 0.97, 0.9) * spec * 0.55;

    // night side: city lights, fading as the terminator passes
    float nightAmt = 1.0 - smoothstep(-0.22, 0.06, ndl);
    vec3 lights = texture2D(uNight, vUv).rgb;
    col += lights * nightAmt * uNightLights * (1.0 - cloud * 0.8);
    col += day * 0.012 * nightAmt;     // faint earthshine so night is not void

    // clouds, lit by the same sun
    float cloudLight = smoothstep(-0.18, 0.42, ndl);
    vec3 cloudCol = vec3(1.0) * (cloudLight * 0.95 + 0.03);
    cloudCol = mix(cloudCol, vec3(1.2, 0.86, 0.66), twilight * 0.5);
    col = mix(col, cloudCol, cloud);

    // atmospheric rim on the sphere itself; the shell adds the outer halo
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
    col += vec3(0.34, 0.56, 1.0) * fres * smoothstep(-0.5, 0.6, ndl) * 0.5;

    col = col / (col + vec3(1.05));
    col = pow(col, vec3(0.9));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;
