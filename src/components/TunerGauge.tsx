interface TunerGaugeProps {
  cents: number | null;
  status: "flat" | "inTune" | "sharp" | null;
}

const TICKS = Array.from({ length: 11 }, (_, index) => index - 5);

export function TunerGauge({ cents, status }: TunerGaugeProps) {
  const clampedCents = Math.max(-50, Math.min(50, cents ?? 0));
  const rotation = clampedCents * 1.35;
  return (
    <div
      className={`gauge gauge--${status ?? "idle"}`}
      role="img"
      aria-label={
        cents === null
          ? "Tuning gauge centered"
          : `Tuning gauge, ${Math.round(cents)} cents ${status === "inTune" ? "in tune" : status}`
      }
    >
      <svg className="gauge__svg" viewBox="0 0 280 176" aria-hidden="true">
        <path className="gauge__track" d="M 25 150 A 115 115 0 0 1 255 150" />
        <path className="gauge__highlight" d="M 126 35 A 115 115 0 0 1 154 35" />
        {TICKS.map((tick) => {
          const angle = (tick / 5) * 67.5;
          const radians = ((angle - 90) * Math.PI) / 180;
          const inner = tick === 0 ? 92 : 98;
          const outer = tick === 0 ? 111 : 108;
          const x1 = 140 + Math.cos(radians) * inner;
          const y1 = 150 + Math.sin(radians) * inner;
          const x2 = 140 + Math.cos(radians) * outer;
          const y2 = 150 + Math.sin(radians) * outer;
          return (
            <line
              key={tick}
              className={`gauge__tick${tick === 0 ? " gauge__tick--center" : ""}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          );
        })}
        <g transform={`rotate(${rotation} 140 150)`}>
          <line className="gauge__needle" x1="140" y1="150" x2="140" y2="52" />
          <circle className="gauge__hub" cx="140" cy="150" r="6" />
        </g>
      </svg>
      <div className="gauge__labels" aria-hidden="true">
        <span>FLAT</span>
        <span>IN TUNE</span>
        <span>SHARP</span>
      </div>
    </div>
  );
}
