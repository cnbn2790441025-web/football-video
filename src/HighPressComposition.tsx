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
      <pattern id="highPressGrass" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="90" fill="#176B45" />
        <rect y="90" width="180" height="90" fill="#1B754B" />
      </pattern>
    </defs>
    <rect x="5" y="5" width="890" height="1240" rx="12" fill="url(#highPressGrass)" stroke="#E8F4EC" strokeWidth="5" />
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

const HighPress: React.FC = () => {
  const frame = useCurrentFrame();

  const pressProgress = interpolate(frame, [20, 75], [0, 1], clamp);
  const trapProgress = interpolate(frame, [65, 125], [0, 1], clamp);
  const regainProgress = interpolate(frame, [125, 165], [0, 1], clamp);
  const exitProgress = interpolate(frame, [165, 195], [0, 1], clamp);
  const pitchProgress = interpolate(frame, [0, 18], [0, 1], clamp);

  const phase =
    frame < 35 ? "BUILD FROM THE BACK" :
    frame < 85 ? "PRESS THE BALL" :
    frame < 130 ? "CUT OFF PASSING LANES" :
    frame < 170 ? "WIN THE BALL BACK" :
    "PRESSING SUCCESS";

  const ballX = interpolate(
    frame,
    [0, 35, 65, 95, 125, 150, 175, 210],
    [450, 450, 360, 300, 330, 330, 390, 390],
    clamp
  );
  const ballY = interpolate(
    frame,
    [0, 35, 65, 95, 125, 150, 175, 210],
    [150, 150, 190, 270, 340, 340, 390, 390],
    clamp
  );

  const strikerX = interpolate(frame, [0, 45, 85, 125, 165, 210], [450, 450, 365, 315, 315, 315], clamp);
  const strikerY = interpolate(frame, [0, 45, 85, 125, 165, 210], [410, 410, 300, 265, 265, 265], clamp);

  const leftPressX = interpolate(frame, [0, 55, 100, 150, 210], [260, 260, 300, 330, 330], clamp);
  const leftPressY = interpolate(frame, [0, 55, 100, 150, 210], [470, 470, 390, 350, 350], clamp);

  const rightPressX = interpolate(frame, [0, 55, 100, 150, 210], [640, 640, 570, 500, 500], clamp);
  const rightPressY = interpolate(frame, [0, 55, 100, 150, 210], [470, 470, 390, 350, 350], clamp);

  const midfielderX = interpolate(frame, [0, 65, 110, 155, 210], [450, 450, 450, 450, 450], clamp);
  const midfielderY = interpolate(frame, [0, 65, 110, 155, 210], [700, 700, 620, 560, 560], clamp);

  const showPress = frame >= 25 && frame < 165;
  const showTrap = frame >= 65 && frame < 150;
  const showRegain = frame >= 125 && frame < 195;
  const showExit = frame >= 165;

  const goalkeeperX = interpolate(frame, [0, 60, 110, 150, 210], [450, 450, 450, 450, 450], clamp);
  const goalkeeperY = interpolate(frame, [0, 60, 110, 150, 210], [95, 95, 95, 95, 95], clamp);

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
          HIGH PRESS
        </div>
        <div style={{ color: "#A9BBCB", fontSize: 25, marginTop: 14 }}>
          CLOSE THE SPACE • BLOCK THE PASS • WIN THE BALL
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
          opacity: pitchProgress,
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
        }}
      >
        <Pitch />
        <svg viewBox="0 0 900 1250" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <marker id="highPressArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
            </marker>
            <marker id="highPressBlockArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FF8B4A" strokeWidth="2.5" />
            </marker>
            <marker id="highPressRegainArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            </marker>
          </defs>

          {/* Front three close down the ball carrier */}
          {showPress && (
            <>
              <path
                d={`M450 410 Q420 330 ${strikerX} ${strikerY}`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="9"
                strokeDasharray="18 13"
                markerEnd="url(#highPressArrow)"
                opacity={pressProgress}
              />
              <path
                d={`M260 470 Q285 410 ${leftPressX} ${leftPressY}`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="8"
                strokeDasharray="16 12"
                markerEnd="url(#highPressArrow)"
                opacity={pressProgress}
              />
              <path
                d={`M640 470 Q610 410 ${rightPressX} ${rightPressY}`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="8"
                strokeDasharray="16 12"
                markerEnd="url(#highPressArrow)"
                opacity={pressProgress}
              />
            </>
          )}

          {/* Passing lanes are screened by the midfield line */}
          {showTrap && (
            <>
              <path
                d="M330 350 L250 250"
                fill="none"
                stroke="#FF8B4A"
                strokeWidth="8"
                strokeDasharray="12 12"
                markerEnd="url(#highPressBlockArrow)"
                opacity={trapProgress}
              />
              <path
                d="M500 350 L650 250"
                fill="none"
                stroke="#FF8B4A"
                strokeWidth="8"
                strokeDasharray="12 12"
                markerEnd="url(#highPressBlockArrow)"
                opacity={trapProgress}
              />
              <path
                d="M450 560 Q450 500 450 455"
                fill="none"
                stroke="#FF8B4A"
                strokeWidth="8"
                strokeDasharray="12 12"
                markerEnd="url(#highPressBlockArrow)"
                opacity={trapProgress}
              />
            </>
          )}

          {/* Ball is won in the opponent's half */}
          {showRegain && (
            <path
              d="M300 350 Q330 320 330 340"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="9"
              strokeDasharray="15 10"
              markerEnd="url(#highPressRegainArrow)"
              opacity={regainProgress}
            />
          )}

          {/* Short safe outlet after the regain */}
          {showExit && (
            <path
              d={`M${strikerX} ${strikerY} Q360 430 ${midfielderX} ${midfielderY}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeDasharray="14 11"
              markerEnd="url(#highPressRegainArrow)"
              opacity={exitProgress}
            />
          )}

          {/* Defending team's build-up shape */}
          <Player x={goalkeeperX} y={goalkeeperY} color="#398BFF" label="GK" scale={0.9} />
          <Player x={250} y={245} color="#398BFF" label="CB" />
          <Player x={650} y={245} color="#398BFF" label="CB" />
          <Player x={450} y={330} color="#398BFF" label="DM" />
          <Player x={700} y={370} color="#398BFF" />
          <Player x={200} y={370} color="#398BFF" />

          {/* Pressing team front line and supporting midfield */}
          <Player x={leftPressX} y={leftPressY} color="#F04452" label="LW" scale={1.08} />
          <Player x={strikerX} y={strikerY} color="#F04452" label="ST" scale={1.12} />
          <Player x={rightPressX} y={rightPressY} color="#F04452" label="RW" scale={1.08} />
          <Player x={midfielderX} y={midfielderY} color="#F04452" label="CM" scale={1.08} />
          <Player x={250} y={610} color="#F04452" />
          <Player x={650} y={610} color="#F04452" />

          <Ball x={ballX} y={ballY} />
        </svg>
      </div>

      <div style={{ position: "absolute", bottom: 150, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#FFD84D", letterSpacing: 3 }}>
          {phase}
        </div>
        <div style={{ marginTop: 22, fontSize: 22, color: "#B7C6D5" }}>
          RED: PRESSING TEAM • BLUE: BUILD-UP TEAM
        </div>
        <div style={{ marginTop: 14, fontSize: 18, color: "#71869A" }}>
          ILLUSTRATIVE TACTICAL ANIMATION
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HighPressEntry: React.FC = () => (
  <Composition
    id="HighPress"
    component={HighPress}
    durationInFrames={210}
    fps={30}
    width={1080}
    height={1920}
  />
);
