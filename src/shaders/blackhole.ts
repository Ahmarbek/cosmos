/**
 * Black hole — screen-space geodesic integrator.
 *
 * For every pixel a photon is traced backwards from the camera through the
 * curved space around a Schwarzschild black hole. The path is integrated with
 * the standard Newtonian-form approximation of null geodesics,
 *
 *     a = -3/2 * h^2 * r_vec / |r|^5,        h = |r x v|
 *
 * which reproduces the real deflection of light to good accuracy outside the
 * photon sphere. Everything the scene shows — the shadow, the photon ring, the
 * far side of the disk lifted over the top, the Einstein ring of lensed stars —
 * falls out of that integration rather than being drawn by hand.
 *
 * Working units are Schwarzschild radii (rs = 1), so the horizon is the unit
 * sphere and the photon sphere sits at r = 1.5.
 */

export const blackHoleVert = /* glsl */ `
  varying vec2 vNdc;
  void main() {
    vNdc = position.xy;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const blackHoleFrag = /* glsl */ `
  precision highp float;

  varying vec2 vNdc;

  uniform vec3  uCamPos;
  uniform vec3  uCamRight;
  uniform vec3  uCamUp;
  uniform vec3  uCamFwd;
  uniform float uTanHalfFov;
  uniform float uAspect;

  uniform vec3  uBhPos;        // world position of the singularity
  uniform float uRsWorld;      // one Schwarzschild radius, in world units
  uniform mat3  uToLocal;      // world -> black-hole frame (disk lies in y = 0)
  uniform mat3  uToWorld;      // inverse of the above

  uniform float uTime;
  uniform float uOpacity;      // chapter fade
  uniform float uDiskInner;    // in rs
  uniform float uDiskOuter;    // in rs
  uniform float uDiskBright;
  uniform float uWarpBoost;    // scroll-velocity reaction

  /**
   * How far the integration is allowed to run.
   *
   * STEPS is the hard ceiling the loop is compiled with; uSteps is the budget
   * actually spent this frame. The two are separate because the budget depends
   * on how much the pass is being downscaled, and that is not known at compile
   * time — the pixel ratio moves at runtime as the frame monitor trims it. A
   * ceiling with a dynamic break lets the march lengthen exactly when the lower
   * sampling density has paid for it, and fall back to the plain budget when it
   * has not, without recompiling anything mid-flight.
   */
  uniform float uSteps;

  #ifndef STEPS
  #define STEPS 128
  #endif

  // ---------------------------------------------------------------- hashes
  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    return fract(p * (p + p));
  }
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash31(i);
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
      mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 4; i++) {
      s += a * vnoise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return s;
  }

  // -------------------------------------------------------------- starfield
  // Three cell layers of increasing density; the sparse layers carry the bright
  // stars, the dense one carries the dust of everything else.
  vec3 starField(vec3 d) {
    vec3 col = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float scale = 34.0 * pow(2.35, fi);
      float thresh = 0.955 - fi * 0.02;
      vec3 p = d * scale;
      vec3 id = floor(p);
      vec3 gv = fract(p) - 0.5;
      vec3 rnd = hash33(id);
      float present = step(thresh, rnd.z);
      vec3 off = (rnd - 0.5) * 0.72;
      float dist = length(gv - off);
      // Halos are kept tight on purpose. A wide soft halo per star looks fine
      // in isolation, but across three cell layers they overlap into a uniform
      // veil — and because this sky is only drawn where light is bent, that
      // veil reads as a grey disc pasted over the black hole.
      float core = smoothstep(0.09, 0.0, dist);
      float halo = smoothstep(0.19, 0.02, dist) * 0.05;
      float tw = 0.72 + 0.28 * sin(uTime * (0.6 + rnd.x * 2.2) + rnd.y * 40.0);
      // colour temperature: mostly white, occasional blue and amber
      vec3 tint = mix(vec3(0.62, 0.74, 1.0), vec3(1.0, 0.82, 0.62), rnd.x);
      tint = mix(vec3(1.0), tint, 0.75);
      col += present * (core + halo) * tw * tint * (0.5 + rnd.y * 1.4) / (1.0 + fi * 1.35);
    }
    return col;
  }

  // ------------------------------------------------------------------ disk
  // Keplerian shear, temperature falling outward, and relativistic beaming on
  // the side rotating toward the observer.
  vec4 diskSample(vec3 hit, vec3 rayDir) {
    float r = length(hit.xz);
    if (r < uDiskInner || r > uDiskOuter) return vec4(0.0);

    float t = (r - uDiskInner) / max(uDiskOuter - uDiskInner, 0.001);
    float ang = atan(hit.z, hit.x);

    // material closer in orbits faster: omega ~ r^-1.5
    float omega = 2.2 * pow(max(r, 0.8), -1.5);
    float rot = uTime * omega;

    // Turbulence is sampled in the gas's own co-rotating frame: the hit point
    // is rotated backwards by however far that annulus has turned. Because the
    // rotation is Keplerian, neighbouring radii shear past each other and the
    // clumps stretch into spiral streaks on their own. Sampling in polar
    // coordinates instead would tie the noise to radius and band the disk into
    // concentric rings.
    float cs = cos(rot);
    float sn = sin(rot);
    vec2 q = vec2(hit.x * cs - hit.z * sn, hit.x * sn + hit.z * cs);
    float n = fbm(vec3(q * 0.62, 3.7));
    float fine = fbm(vec3(q * 2.4, 9.1));
    float density = mix(0.42, 1.0, n) * mix(0.62, 1.0, fine);

    // soft inner and outer edges
    float edge = smoothstep(0.0, 0.10, t) * (1.0 - smoothstep(0.62, 1.0, t));
    density *= edge * pow(1.0 - t, 0.95);

    // temperature: blue-white at the inner rim, ember at the rim of the disk
    vec3 hot = vec3(1.0, 0.95, 0.88);
    vec3 mid = vec3(1.0, 0.72, 0.36);
    vec3 cool = vec3(0.95, 0.34, 0.12);
    vec3 col = mix(hot, mid, smoothstep(0.0, 0.30, t));
    col = mix(col, cool, smoothstep(0.34, 0.86, t));
    col = mix(col, vec3(0.62, 0.78, 1.0), smoothstep(0.13, 0.0, t) * 0.9);

    // relativistic Doppler beaming — the approaching limb is far brighter
    vec3 vel = normalize(cross(vec3(0.0, 1.0, 0.0), hit));
    float beta = clamp(0.72 / sqrt(max(r, 1.2)), 0.0, 0.78);
    float mu = dot(vel * beta, -rayDir);
    float dop = 1.0 / max(1.0 - mu, 0.22);
    float beam = pow(dop, 3.0);

    // gravitational redshift toward the inner edge
    float grav = sqrt(max(1.0 - 1.0 / max(r, 1.05), 0.02));

    float intensity = density * beam * grav * uDiskBright;
    // the inner rim is where the gas is hottest and moving fastest
    intensity *= 1.0 + smoothstep(0.30, 0.0, t) * 1.15;
    col *= intensity;
    float alpha = clamp(density * 1.9, 0.0, 1.0);
    return vec4(col, alpha);
  }

  void main() {
    // primary ray, in world space
    vec2 ndc = vNdc;
    vec3 dir = normalize(
      uCamFwd + uCamRight * ndc.x * uTanHalfFov * uAspect + uCamUp * ndc.y * uTanHalfFov
    );
    vec3 dir0 = dir;

    // move into the black-hole frame, measured in Schwarzschild radii
    vec3 p = uToLocal * ((uCamPos - uBhPos) / uRsWorld);
    vec3 v = uToLocal * dir;

    // Cheap analytic rejection. A ray whose closest approach to the hole is
    // far outside the disk is deflected by a fraction of a degree and cannot
    // reach the disk at all, so it never enters the integrator. Most of the
    // screen takes this path while the hole is still distant, which is what
    // makes a per-pixel geodesic trace affordable at all.
    float startR = length(p);
    float tca = -dot(p, v);
    float perp2 = max(dot(p, p) - tca * tca, 0.0);
    const float B_MAX = 27.0;

    // Analytic light spill, computed for every pixel including the rejected
    // ones. Real bloom would mean extra render targets and two more full-screen
    // passes for a single object; an inverse-square falloff around the hole's
    // screen position sells the same glow for the cost of a cross product.
    vec3 toBh = normalize(uBhPos - uCamPos);
    float sep = length(cross(dir0, toBh));
    float bhDist = length(uCamPos - uBhPos) / uRsWorld;
    float haloBase = 1.0 / (1.0 + pow(sep * bhDist * 0.30, 2.0));
    float halo = haloBase * haloBase * haloBase * 0.5;

    if (tca < 0.0 || perp2 > B_MAX * B_MAX) {
      if (halo < 0.004) discard;
      vec3 hc = vec3(1.0, 0.72, 0.42) * halo * 1.5;
      hc = hc / (hc + vec3(1.0));
      gl_FragColor = vec4(pow(hc, vec3(0.86)), clamp(halo, 0.0, 1.0) * uOpacity);
      #include <colorspace_fragment>
      return;
    }

    vec3 h = cross(p, v);
    float h2 = dot(h, h);

    // Whether a photon is swallowed is not something that needs to be
    // discovered by integration: in Schwarzschild geometry any ray whose
    // impact parameter is below 3*sqrt(3)/2 Schwarzschild radii falls in, and
    // that threshold is exact. Testing it analytically gives a perfectly smooth
    // shadow edge — no stair-stepping from the step size — and lets doomed rays
    // stop early instead of spending the whole step budget falling.
    const float B_CRIT = 2.598;
    float bImp = sqrt(perp2);
    float shadow = smoothstep(B_CRIT, B_CRIT + 0.16, bImp);
    bool doomed = shadow < 0.999;

    vec3 acc = vec3(0.0);
    float transmit = 1.0;

    float escapeR = max(startR * 1.12, 30.0);

    for (int i = 0; i < STEPS; i++) {
      if (float(i) >= uSteps) break;

      float r2 = dot(p, p);
      float r = sqrt(r2);

      // nothing below the disk's inner edge can still contribute
      if (r < 1.0 || (doomed && r < uDiskInner * 0.92)) break;
      if (r > escapeR && dot(p, v) > 0.0) break;

      // Step length scales with distance: coarse out in the near-flat field,
      // fine where the curvature actually bends the path. Without the coarse
      // far-field stride a distant camera exhausts the budget before its rays
      // even arrive.
      float dt = clamp(0.09 * r, 0.015, 8.0);
      if (r < 6.0) dt *= 0.5;
      if (r < 3.0) dt *= 0.6;

      vec3 a = -1.5 * h2 * p / (r2 * r2 * r);
      vec3 prev = p;
      v += a * dt;
      p += v * dt;

      // did this step cross the disk plane?
      if (prev.y * p.y < 0.0 && transmit > 0.004) {
        float f = prev.y / (prev.y - p.y);
        vec3 hit = mix(prev, p, clamp(f, 0.0, 1.0));
        vec4 d = diskSample(hit, normalize(v));
        if (d.a > 0.0) {
          acc += d.rgb * transmit;
          transmit *= (1.0 - d.a);
        }
      }
    }

    vec3 outDir = normalize(uToWorld * v);

    vec3 col = acc;
    float alpha = 1.0 - transmit;

    {
      // How far the photon was bent decides how much of the real
      // three-dimensional starfield behind this quad stays visible: where
      // spacetime is effectively flat the quad gets out of the way entirely.
      float bend = 1.0 - clamp(dot(outDir, dir0), -1.0, 1.0);
      float lensMask = smoothstep(0.02, 0.55, clamp(bend * 2.6, 0.0, 1.0));
      // the sky is what the soft shadow edge eats into — the disk in front of
      // the hole must not be dimmed by it
      if (lensMask > 0.004) col += starField(outDir) * 1.3 * transmit * lensMask * shadow;
      alpha = max(alpha, max(lensMask * 0.97, 1.0 - shadow));
      if (alpha < 0.003) discard;
    }

    // photon-ring rim, strongest right at the capture boundary
    float ring = smoothstep(0.0, 1.0, 1.0 - transmit);
    col += vec3(1.0, 0.86, 0.66) * ring * 0.09;

    // Glare, kept tight and kept off the silhouette — the shadow is the
    // subject of the shot and a wide veil would flatten it into grey.
    float glare = halo * shadow * (0.25 + 0.75 * transmit);
    col += vec3(1.0, 0.72, 0.42) * glare;
    alpha = max(alpha, glare);

    col *= 1.0 + uWarpBoost * 0.35;

    // exposure, then a filmic shoulder so the disk core rolls off instead of
    // clipping to flat white
    col *= 1.5;
    col = col / (col + vec3(1.0));
    col = pow(col, vec3(0.86));

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0) * uOpacity);
    #include <colorspace_fragment>
  }
`;

/**
 * Composite pass.
 *
 * The integrator above is the most expensive thing in the project by a wide
 * margin — a per-pixel geodesic march — so it is not drawn straight to the
 * canvas. It renders once into an offscreen target sized in CSS pixels rather
 * than device pixels, and this pass lifts that result onto the screen. On a
 * high-density display that is a three- to four-fold cut in the work, spent
 * instead on a longer integration: a smoother disk and a truer photon ring.
 *
 * The offscreen target holds linear, unblended colour with the chapter fade
 * already in its alpha, so the composite is a straight texture fetch and the
 * blend with the real starfield behind it happens exactly as it did before.
 */
export const compositeVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const compositeFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;

  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (c.a < 0.002) discard;
    gl_FragColor = c;
    #include <colorspace_fragment>
  }
`;
