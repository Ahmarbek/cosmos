import { motion } from 'framer-motion';
import { useT } from '../../i18n';
import { UI } from '../../i18n/ui';

/**
 * Line diagrams for the black-hole chapter.
 *
 * Drawn rather than rendered: a stroked schematic reads as explanation, while a
 * second piece of 3D beside the real one would only compete with it.
 */
const stroke = 'rgba(234,234,242,0.55)';
const accent = '#7C5CFF';

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: i * 0.22, duration: 1.6, ease: 'easeInOut' as const },
      opacity: { delay: i * 0.22, duration: 0.3 },
    },
  }),
};

const Caption = ({ x, y, children }: { x: number; y: number; children: string }) => (
  <text x={x} y={y} fill="rgba(234,234,242,0.4)" fontSize="6" textAnchor="middle" letterSpacing="1.6">
    {children}
  </text>
);

export default function Diagram({ kind }: { kind: string }) {
  const t = useT();
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[250px] h-auto" aria-hidden>
      <motion.g initial="hidden" animate="show">
        {kind === 'horizon' && (
          <>
            <motion.circle cx="100" cy="60" r="22" fill="#000" stroke={stroke} strokeWidth="0.6" variants={draw} custom={0} />
            <motion.circle cx="100" cy="60" r="33" fill="none" stroke={accent} strokeWidth="0.7" strokeDasharray="2 3" variants={draw} custom={1} />
            <motion.path d="M18 60 H70" stroke={stroke} strokeWidth="0.6" fill="none" variants={draw} custom={2} />
            <motion.path d="M70 60 q10 0 16 -7" stroke={accent} strokeWidth="0.8" fill="none" variants={draw} custom={3} />
            <Caption x={100} y={104}>{t(UI.figHorizon)}</Caption>
          </>
        )}
        {kind === 'disk' && (
          <>
            <motion.ellipse cx="100" cy="60" rx="70" ry="16" fill="none" stroke={stroke} strokeWidth="0.6" variants={draw} custom={0} />
            <motion.ellipse cx="100" cy="60" rx="44" ry="10" fill="none" stroke={accent} strokeWidth="0.7" variants={draw} custom={1} />
            <motion.circle cx="100" cy="60" r="13" fill="#000" stroke={stroke} strokeWidth="0.6" variants={draw} custom={2} />
            <motion.path d="M30 60 q70 -46 140 0" stroke="#FFB877" strokeWidth="0.7" fill="none" variants={draw} custom={3} />
            <Caption x={100} y={104}>{t(UI.figDisk)}</Caption>
          </>
        )}
        {kind === 'dilation' && (
          <>
            <motion.circle cx="46" cy="60" r="16" fill="none" stroke={stroke} strokeWidth="0.6" variants={draw} custom={0} />
            <motion.path d="M46 60 V48" stroke={stroke} strokeWidth="0.8" variants={draw} custom={1} />
            <motion.path d="M46 60 L54 64" stroke={accent} strokeWidth="0.8" variants={draw} custom={2} />
            <motion.circle cx="150" cy="60" r="16" fill="none" stroke={stroke} strokeWidth="0.6" variants={draw} custom={1} />
            <motion.path d="M150 60 V48" stroke={stroke} strokeWidth="0.8" variants={draw} custom={2} />
            <motion.path d="M150 60 L156 56" stroke={accent} strokeWidth="0.8" variants={draw} custom={3} />
            <motion.path d="M70 60 H126" stroke={stroke} strokeWidth="0.4" strokeDasharray="1 4" variants={draw} custom={3} />
            <Caption x={100} y={104}>{t(UI.figDilation)}</Caption>
          </>
        )}
        {kind === 'singularity' && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.path
                key={i}
                d={`M${30 + i * 4} ${20 + i * 8} Q100 ${62 + i * 3} ${170 - i * 4} ${20 + i * 8}`}
                stroke={i === 2 ? accent : stroke}
                strokeWidth="0.5"
                fill="none"
                variants={draw}
                custom={i}
              />
            ))}
            <motion.circle cx="100" cy="74" r="1.6" fill="#fff" variants={draw} custom={5} />
            <Caption x={100} y={106}>{t(UI.figSingularity)}</Caption>
          </>
        )}
        {kind === 'formation' && (
          <>
            <motion.circle cx="40" cy="60" r="24" fill="none" stroke={stroke} strokeWidth="0.6" variants={draw} custom={0} />
            <motion.circle cx="100" cy="60" r="12" fill="none" stroke="#FFB877" strokeWidth="0.6" variants={draw} custom={1} />
            <motion.circle cx="100" cy="60" r="30" fill="none" stroke="#FFB877" strokeWidth="0.4" strokeDasharray="1 3" variants={draw} custom={2} />
            <motion.circle cx="162" cy="60" r="5" fill="#000" stroke={accent} strokeWidth="0.8" variants={draw} custom={3} />
            <Caption x={100} y={104}>{t(UI.figFormation)}</Caption>
          </>
        )}
        {kind === 'scale' && (
          <>
            <motion.circle cx="34" cy="64" r="4" fill="#000" stroke={stroke} strokeWidth="0.7" variants={draw} custom={0} />
            <motion.circle cx="124" cy="58" r="32" fill="#000" stroke={accent} strokeWidth="0.7" variants={draw} custom={1} />
            <text x="34" y="82" fill="rgba(234,234,242,0.4)" fontSize="5" textAnchor="middle" letterSpacing="1.2">10 M☉</text>
            <text x="124" y="106" fill="rgba(234,234,242,0.4)" fontSize="5" textAnchor="middle" letterSpacing="1.2">6.5 BILLION M☉</text>
          </>
        )}
      </motion.g>
    </svg>
  );
}
