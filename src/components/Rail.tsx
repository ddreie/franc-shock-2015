import { useEffect, useState } from 'react';
import { stations } from '../stations';

const MAX_W = 14;      // stroke width of the line at the shock (100%)
const X = 18;          // x of the line inside the rail
const TOP = 0.14, BOTTOM = 0.86;

/** Fixed guiding line: thick at the shock, thinning to 12% where the result is reached; fills red as you scroll. */
export default function Rail() {
  const [h, setH] = useState(800);
  const [progress, setProgress] = useState(0); // 0 .. stations.length - 1

  useEffect(() => {
    const update = () => {
      setH(window.innerHeight);
      const mid = window.scrollY + window.innerHeight * 0.45;
      const tops = stations.map(s => (document.getElementById(s.id)?.getBoundingClientRect().top ?? 0) + window.scrollY);
      let p = 0;
      for (let i = 0; i < tops.length; i++) {
        const next = i + 1 < tops.length ? tops[i + 1] : document.body.scrollHeight;
        if (mid >= tops[i]) p = i + Math.min(1, (mid - tops[i]) / Math.max(1, next - tops[i]));
      }
      const atEnd = window.scrollY + window.innerHeight >= document.body.scrollHeight - 4;
      setProgress(atEnd ? stations.length - 1 : Math.min(p, stations.length - 1));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  const n = stations.length;
  const yAt = (i: number) => h * (TOP + (BOTTOM - TOP) * (i / (n - 1)));
  const segs = stations.slice(0, -1).map((s, i) => {
    const w0 = s.width * MAX_W, w1 = stations[i + 1].width * MAX_W, y0 = yAt(i), y1 = yAt(i + 1);
    return `M${X - w0 / 2},${y0} L${X + w0 / 2},${y0} L${X + w1 / 2},${y1} L${X - w1 / 2},${y1} Z`;
  }).join(' ');
  const active = Math.min(n - 1, Math.floor(progress + 0.02));

  return (
    <nav className="rail" aria-label="Sections">
      <svg aria-hidden>
        <defs><clipPath id="rail-clip"><rect x="0" y="0" width="60" height={yAt(progress)} /></clipPath></defs>
        <path d={segs} fill="#dcd9d1" />
        <path d={segs} fill="#d52b1e" clipPath="url(#rail-clip)" />
        {stations.map((s, i) => (
          <rect key={s.id} x={X - 4.5} y={yAt(i) - 4.5} width={9} height={9}
            fill={i <= active ? '#d52b1e' : '#f6f5f1'} stroke={i <= active ? '#d52b1e' : '#a3a097'} strokeWidth={1.5} />
        ))}
      </svg>
      <span className="pct" style={{ top: yAt(0), left: X - 12 }}>100%</span>
      <span className="pct" style={{ top: yAt(3), left: X - 9 }}>12%</span>
      {stations.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} className={i === active ? 'on' : ''} style={{ top: yAt(i) }}>
          {s.no}<span>{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
