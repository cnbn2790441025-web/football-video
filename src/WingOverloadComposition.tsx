import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
} from "remotion";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const Pitch: React.FC = () => (
  <svg viewBox="0 0 900 1250" style={{ width: "100%", height: "100%" }}>
    <defs>
      <pattern id="grass" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="90" fill="#176B45" />
        <rect y="90" width="180" height="90" fill="#1B754B" />
      </pattern>
    </defs>
    <rect x="5" y="5" width="890" height="1240" rx="12" fill="url(#grass)" stroke="#E8F4EC" strokeWidth="5" />
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
    <circle r="30" fill="rgba(0,0,0,0.25)" cx="3" cy="5" />
    <circle r="27" fill={color} stroke="#FFFFFF" strokeWidth="5" />
    <circle r="8" fill="#FFFFFF" opacity="0.9" />
    {label && (
      <text y="53" textAnchor="middle" fill="#FFFFFF" fontSize="21" fontWeight="900">
        {label}
      </text>
    )}
  </g>
);

const Ball: React.FC<{ x: number; y: number; opacity?: number }> = ({
  x,
  y,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <circle r="17" cx="1" cy="2" fill="rgba(0,0,0,0.3)" />
    <circle r="17" fill="#FFFFFF" stroke="#111827" strokeWidth="1.8" />
    <path d="M-5 -6 L5 -6 L9 2 L0 8 L-9 2 Z" fill="#111827" />
    <path d="M-5 -6 L-10 -12 L-15 -8 L-13 0 L-9 2" fill="#111827" />
    <path d="M5 -6 L10 -12 L15 -8 L13 0 L9 2" fill="#111827" />
    <path d="M-9 2 L-12 10 L-5 15 L0 8" fill="#111827" />
    <path d="M9 2 L12 10 L5 15 L0 8" fill="#111827" />
  </g>
);

const WingOverload: React.FC = () => {
  const frame = useCurrentFrame();

  const wingerX = interpolate(frame, [30, 75, 120], [625, 720, 735], clamp);
  const wingerY = interpolate(frame, [30, 75, 120], [820, 660, 470], clamp);
  const fullbackX = interpolate(frame, [75, 135, 165], [520, 650, 760], clamp);
  const fullbackY = interpolate(frame, [75, 135, 165], [930, 720, 390], clamp);
  const midfielderX = interpolate(frame, [105, 150], [430, 575], clamp);
  const midfielderY = interpolate(frame, [105, 150], [760, 570], clamp);

  const ballX = interpolate(frame, [0, 30, 75, 120, 135, 180, 210], [625, 625, 720, 735, 735, 575, 450], clamp);
  const ballY = interpolate(frame, [0, 30, 75, 120, 135, 180, 210], [820, 820, 660, 470, 470, 570, 390], clamp);

  const showOverlap = frame >= 75 && frame <= 179;
  const showCombination = frame >= 135 && frame < 180;
  const showCutback = frame >= 180;
  const phase = frame < 30 ? "BUILD THE ATTACK" :
    frame < 75 ? "WINGER DRIVES FORWARD" :
    frame < 135 ? "FULLBACK OVERLAPS" :
    frame < 180 ? "CREATE THE 3v2" : "CUTBACK INTO THE BOX";

  const progress = interpolate(frame, [0, 20], [0, 1], clamp);

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
          ATTACKING TACTICS
        </div>
        <div style={{ fontSize: 66, fontWeight: 1000, marginTop: 18, letterSpacing: 2 }}>
          WING OVERLOAD
        </div>
        <div style={{ color: "#A9BBCB", fontSize: 25, marginTop: 14 }}>
          CREATE A 3v2 ADVANTAGE ON THE FLANK
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
          opacity: progress,
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
        }}
      >
        <Pitch />

        <svg
          viewBox="0 0 900 1250"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
      <marker id="runArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
      </marker>
      <marker id="passArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      </marker>
          </defs>
          {showOverlap && (
            <path
              d={`M520 930 Q650 760 ${fullbackX} ${fullbackY}`}
              fill="none"
              stroke="#FFD84D"
              strokeWidth="9"
              strokeDasharray="18 13"
              markerEnd="url(#runArrow)"
              opacity="0.95"
            />
          )}
          {showCombination && (
            <path
              d={`M${wingerX} ${wingerY} Q680 430 ${midfielderX} ${midfielderY}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeDasharray="15 12"
              markerEnd="url(#passArrow)"
            />
          )}
          {showCutback && (
            <path
              d="M575 570 Q520 430 450 390"
              fill="none"
              stroke="#FFD84D"
              strokeWidth="11"
              strokeDasharray="17 10"
              markerEnd="url(#runArrow)"
            />
          )}

          <Player x={300} y={530} color="#F04452" />
          <Player x={450} y={390} color="#F04452" />
          <Player x={450} y={170} color="#F04452" />

          <Player x={690} y={620} color="#398BFF" />
          <Player x={780} y={480} color="#398BFF" />
          <Player x={760} y={300} color="#398BFF" />
          <Player x={560} y={240} color="#398BFF" />
          <Player x={350} y={280} color="#398BFF" />

          <Player x={wingerX} y={wingerY} color="#F04452" label="W" scale={1.12} />
          <Player x={fullbackX} y={fullbackY} color="#F04452" label="FB" scale={1.12} />
          <Player x={midfielderX} y={midfielderY} color="#F04452" label="M" scale={1.12} />
          <Ball x={ballX} y={ballY} />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 150,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 900, color: "#FFD84D", letterSpacing: 3 }}>
          {phase}
        </div>
        <div style={{ marginTop: 22, fontSize: 22, color: "#B7C6D5" }}>
          RED: ATTACKING TEAM  •  BLUE: DEFENDING TEAM
        </div>
        <div style={{ marginTop: 14, fontSize: 18, color: "#71869A" }}>
          ILLUSTRATIVE TACTICAL ANIMATION
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const WingOverloadEntry: React.FC = () => (
  <Composition
    id="WingOverload"
    component={WingOverload}
    durationInFrames={210}
    fps={30}
    width={1080}
    height={1920}
  />
);
