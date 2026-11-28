import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const Pitch: React.FC = () => (
  <svg viewBox="0 0 900 1250" style={{ width: "100%", height: "100%" }}>
    <defs>
      <pattern id="lowBlockGrass" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="90" fill="#176B45" />
        <rect y="90" width="180" height="90" fill="#1B754B" />
      </pattern>
    </defs>
    <rect x="5" y="5" width="890" height="1240" rx="12" fill="url(#lowBlockGrass)" stroke="#E8F4EC" strokeWidth="5" />
    <line x1="5" y1="625" x2="895" y2="625" stroke="#E8F4EC" strokeWidth="4" />
    <circle cx="450" cy="625" r="110" fill="none" stroke="#E8F4EC" strokeWidth="4" />
    <circle cx="450" cy="625" r="7" fill="#E8F4EC" />
    <rect x="190" y="5" width="520" height="190" fill="none" stroke="#E8F4EC" strokeWidth="4" />
    <rect x="315" y="5" width="270" height="75" fill="none" stroke="#E8F4EC" strokeWidth="4" />
    <rect x="190" y="1055" width="520" height="190" fill="none" stroke="#E8F4EC" strokeWidth="4" />
    <rect x="315" y="1170" width="270" height="75" fill="none" stroke="#E8F4EC" strokeWidth="4" />
    <path d="M190 195 Q450 320 710 195" fill="none" stroke="#E8F4EC" strokeWidth="3" />
    <path d="M190 1055 Q450 930 710 1055" fill="none" stroke="#E8F4EC" strokeWidth="3" />
  </svg>
);

const Player: React.FC<{
  x: number;
  y: number;
  color: string;
  label?: string;
  scale?: number;
}> = ({ x, y, color, label, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r="30" cx="3" cy="5" fill="rgba(0,0,0,0.25)" />
    <circle r="27" fill={color} stroke="#FFFFFF" strokeWidth="5" />
    <circle r="8" fill="#FFFFFF" opacity="0.9" />
    {label && (
      <text y="53" textAnchor="middle" fill="#FFFFFF" fontSize="21" fontWeight="900">
        {label}
      </text>
    )}
  </g>
);

const Ball: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r="18" cx="2" cy="3" fill="rgba(0,0,0,0.3)" />
    <circle r="17" fill="#FFFFFF" stroke="#111827" strokeWidth="2" />
    <path d="M-5 -6 L5 -6 L9 2 L0 8 L-9 2 Z" fill="#111827" />
    <path d="M-5 -6 L-10 -12 L-15 -8 L-13 0 L-9 2" fill="#111827" />
    <path d="M5 -6 L10 -12 L15 -8 L13 0 L9 2" fill="#111827" />
    <path d="M-9 2 L-12 10 L-5 15 L0 8" fill="#111827" />
    <path d="M9 2 L12 10 L5 15 L0 8" fill="#111827" />
  </g>
);

const LowBlock: React.FC = () => {
  const frame = useCurrentFrame();

  const blockShift = interpolate(frame, [45, 100, 145], [0, 1, 0.45], clamp);
  const regain = interpolate(frame, [145, 175], [0, 1], clamp);
  const outlet = interpolate(frame, [170, 205], [0, 1], clamp);
  const pitchFade = interpolate(frame, [0, 18], [0, 1], clamp);

  const phase =
    frame < 40 ? "DROP INTO A COMPACT SHAPE" :
    frame < 90 ? "PROTECT THE CENTRAL SPACE" :
    frame < 145 ? "FORCE PLAY OUT WIDE" :
    frame < 180 ? "WIN THE BALL BACK" :
    "PLAY OUT AND COUNTER";

  const ballX = interpolate(
    frame,
    [0, 35, 70, 105, 140, 160, 185, 210],
    [450, 450, 650, 700, 620, 480, 360, 360],
    clamp
  );
  const ballY = interpolate(
    frame,
    [0, 35, 70, 105, 140, 160, 185, 210],
    [280, 280, 360, 430, 500, 760, 590, 590],
    clamp
  );

  const shiftX = blockShift * 55;
  const regainX = interpolate(frame, [145, 175, 210], [480, 480, 360], clamp);
  const regainY = interpolate(frame, [145, 175, 210], [760, 760, 590], clamp);

  const showShift = frame >= 40 && frame < 150;
  const showBlock = frame >= 55 && frame < 150;
  const showRegain = frame >= 145 && frame < 190;
  const showOutlet = frame >= 170;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07111D",
        color: "white",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 95, width: "100%", textAlign: "center" }}>
        <div style={{ color: "#FFD84D", fontSize: 25, fontWeight: 900, letterSpacing: 7 }}>
          DEFENDING TACTICS
        </div>
        <div style={{ fontSize: 66, fontWeight: 1000, marginTop: 18, letterSpacing: 2 }}>
          LOW BLOCK
        </div>
        <div style={{ color: "#A9BBCB", fontSize: 25, marginTop: 14 }}>
          STAY COMPACT • CLOSE THE LANES • FORCE WIDE
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 55,
          top: 390,
          width: 970,
          height: 1190,
          border: "3px solid rgba(255,255,255,0.18)",
          borderRadius: 28,
          overflow: "hidden",
          opacity: pitchFade,
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
        }}
      >
        <Pitch />
        <svg viewBox="0 0 900 1250" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <marker id="lowBlockShiftArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
            </marker>
            <marker id="lowBlockLaneArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FF8B4A" strokeWidth="2.5" />
            </marker>
            <marker id="lowBlockRegainArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            </marker>
          </defs>

          {/* Compact defensive block */}
          {showShift && (
            <>
              <path d={`M250 650 Q310 610 ${250 + shiftX} 650`} fill="none" stroke="#FFD84D" strokeWidth="8" strokeDasharray="15 12" markerEnd="url(#lowBlockShiftArrow)" opacity={blockShift} />
              <path d={`M650 650 Q590 610 ${650 - shiftX} 650`} fill="none" stroke="#FFD84D" strokeWidth="8" strokeDasharray="15 12" markerEnd="url(#lowBlockShiftArrow)" opacity={blockShift} />
            </>
          )}

          {/* Central passing lanes are protected */}
          {showBlock && (
            <>
              <path d="M330 520 L330 720" fill="none" stroke="#FF8B4A" strokeWidth="10" strokeDasharray="14 12" markerEnd="url(#lowBlockLaneArrow)" />
              <path d="M570 520 L570 720" fill="none" stroke="#FF8B4A" strokeWidth="10" strokeDasharray="14 12" markerEnd="url(#lowBlockLaneArrow)" />
              <path d="M390 690 L510 690" fill="none" stroke="#FF8B4A" strokeWidth="9" strokeDasharray="12 10" />
            </>
          )}

          {/* Force the opponent toward the touchline */}
          {frame >= 65 && frame < 145 && (
            <path d="M450 300 Q610 320 735 420" fill="none" stroke="#FFD84D" strokeWidth="8" strokeDasharray="16 12" markerEnd="url(#lowBlockShiftArrow)" opacity={interpolate(frame, [65, 95], [0, 1], clamp)} />
          )}

          {/* Regain possession */}
          {showRegain && (
            <path d="M620 700 Q520 750 480 760" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeDasharray="15 10" markerEnd="url(#lowBlockRegainArrow)" opacity={regain} />
          )}

          {/* Short counter outlet */}
          {showOutlet && (
            <path d={`M480 760 Q420 650 ${regainX} ${regainY}`} fill="none" stroke="#FFFFFF" strokeWidth="8" strokeDasharray="14 11" markerEnd="url(#lowBlockRegainArrow)" opacity={outlet} />
          )}
        </svg>

        <svg viewBox="0 0 900 1250" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Blue attacking team */}
          <Player x={450} y={170} color="#398BFF" label="ST" />
          <Player x={250} y={260} color="#398BFF" label="LW" />
          <Player x={650} y={260} color="#398BFF" label="RW" />
          <Player x={350} y={390} color="#398BFF" label="CM" />
          <Player x={550} y={390} color="#398BFF" label="CM" />
          <Player x={720} y={450} color="#398BFF" label="FB" />
          <Player x={180} y={450} color="#398BFF" label="FB" />

          {/* Red low defensive block */}
          <Player x={450} y={1130} color="#F04452" label="GK" scale={0.9} />
          <Player x={270 + shiftX} y={900} color="#F04452" label="CB" />
          <Player x={410 + shiftX * 0.35} y={900} color="#F04452" label="CB" />
          <Player x={550 - shiftX * 0.35} y={900} color="#F04452" label="CB" />
          <Player x={690 - shiftX} y={900} color="#F04452" label="CB" />
          <Player x={270 + shiftX} y={730} color="#F04452" label="LM" />
          <Player x={390 + shiftX * 0.35} y={730} color="#F04452" label="CM" />
          <Player x={510 - shiftX * 0.35} y={730} color="#F04452" label="CM" />
          <Player x={630 - shiftX} y={730} color="#F04452" label="RM" />
          <Player x={370} y={570} color="#F04452" label="ST" />
          <Player x={530} y={570} color="#F04452" label="ST" />
          <Ball x={ballX} y={ballY} />
        </svg>
      </div>

      <div style={{ position: "absolute", bottom: 150, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#FFD84D", letterSpacing: 3 }}>
          {phase}
        </div>
        <div style={{ marginTop: 22, fontSize: 22, color: "#B7C6D5" }}>
          RED: DEFENSIVE BLOCK • BLUE: ATTACKING TEAM
        </div>
        <div style={{ marginTop: 14, fontSize: 18, color: "#71869A" }}>
          ILLUSTRATIVE TACTICAL ANIMATION
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LowBlockEntry: React.FC = () => (
  <Composition
    id="LowBlock"
    component={LowBlock}
    durationInFrames={210}
    fps={30}
    width={1080}
    height={1920}
  />
);
