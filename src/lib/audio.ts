/**
 * Ambient sound, synthesised rather than shipped.
 *
 * No audio files: a drifting drone is built from detuned oscillators and
 * filtered noise, which keeps the payload at zero bytes and lets the bed react
 * to where the visitor is in the journey. Nothing starts until a real user
 * gesture, so autoplay policy is respected by construction.
 */

type Ctx = AudioContext & { _cosmos?: boolean };

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let drone: { stop: () => void } | null = null;
let started = false;

function noiseBuffer(c: AudioContext, seconds = 4) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    // brown-ish noise: gentler than white, sits under the drone
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.2;
  }
  return buf;
}

export function audioReady() {
  return started;
}

export async function startAudio() {
  if (started) return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  await ctx.resume();

  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const now = ctx.currentTime;

  // --- drone: a low fifth, slightly detuned, moving under a slow filter -----
  const bus = ctx.createGain();
  bus.gain.value = 0.5;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  filter.Q.value = 0.8;
  bus.connect(filter);
  filter.connect(master);

  const oscs: OscillatorNode[] = [];
  const freqs = [55, 82.5, 110, 164.8];
  freqs.forEach((f, i) => {
    const o = ctx!.createOscillator();
    o.type = i < 2 ? 'sine' : 'triangle';
    o.frequency.value = f * (1 + (i % 2 ? 0.0016 : -0.0013));
    const g = ctx!.createGain();
    g.gain.value = [0.5, 0.32, 0.16, 0.07][i];
    o.connect(g);
    g.connect(bus);
    o.start(now);
    oscs.push(o);
  });

  // --- air: filtered noise, panned slowly -----------------------------------
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx);
  noise.loop = true;
  const nf = ctx.createBiquadFilter();
  nf.type = 'bandpass';
  nf.frequency.value = 620;
  nf.Q.value = 0.5;
  const ng = ctx.createGain();
  ng.gain.value = 0.12;
  noise.connect(nf);
  nf.connect(ng);
  ng.connect(master);
  noise.start(now);

  // --- slow movement --------------------------------------------------------
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.035;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start(now);

  master.gain.linearRampToValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.34, now + 4);

  drone = {
    stop: () => {
      oscs.forEach((o) => o.stop());
      noise.stop();
      lfo.stop();
    },
  };
  started = true;
}

export function setAudioEnabled(on: boolean) {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(on ? 0.34 : 0.0001, now + 0.9);
}

/**
 * Ties the bed to the journey: brighter and wider out in deep space, darker and
 * heavier at the black hole, warmer once we reach Earth.
 */
export function updateAudioScene(progress: number) {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  const target = 0.26 + Math.sin(progress * Math.PI) * 0.12;
  master.gain.setTargetAtTime(Math.max(target, 0.05), now, 1.5);
}

/** Short interface tone — used sparingly, on commitment actions only. */
export function blip(freq = 880, dur = 0.09, gain = 0.05) {
  if (!ctx || !master || !started) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, now);
  o.frequency.exponentialRampToValueAtTime(freq * 0.6, now + dur);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  o.connect(g);
  g.connect(master);
  o.start(now);
  o.stop(now + dur + 0.02);
}

export function disposeAudio() {
  drone?.stop();
  ctx?.close();
  ctx = null;
  master = null;
  drone = null;
  started = false;
}
