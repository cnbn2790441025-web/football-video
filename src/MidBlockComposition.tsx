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
      <pattern id="midBlockGrass" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="90" fill="#176B45" />
        <rect y="90" width="180" height="90" fill="#1B754B" />
      </pattern>
    </defs>
    <rect x="5" y="5" width="890" height="1240" rx="12" fill="url(#midBlockGrass)" stroke="#E8F4EC" strokeWidth="5" />
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

const MidBlock: React.FC = () => {
  const frame = useCurrentFrame();

  const compact = interpolate(frame, [35, 75, 115], [0, 1, 0.7], clamp);
  const guideWide = interpolate(frame, [80, 115, 150], [0, 1, 1], clamp);
  const press = interpolate(frame, [125, 155, 175], [0, 1, 1], clamp);
  const regain = interpolate(frame, [160, 185], [0, 1], clamp);
  const transition = interpolate(frame, [180, 205], [0, 1], clamp);
  const pitchFade = interpolate(frame, [0, 18], [0, 1], clamp);

  const phase =
    frame < 40 ? "HOLD THE MID BLOCK" :
    frame < 85 ? "PROTECT CENTRAL LANES" :
    frame < 130 ? "GUIDE PLAY WIDE" :
    frame < 170 ? "TRIGGER THE PRESS" :
    "WIN IT AND TRANSITION";

  const lateralShift = compact * 42;

  const ballX = interpolate(
    frame,
    [0, 35, 70, 105, 135, 160, 185, 210],
    [450, 450, 650, 735, 700, 620, 480, 360],
    clamp
  );

  const ballY = interpolate(
    frame,
    [0, 35, 70, 105, 135, 160, 185, 210],
    [300, 300, 370, 450, 500, 560, 700, 590],
    clamp
  );

  const strikerX = interpolate(frame, [0, 100, 145, 175, 210], [450, 450, 450, 500, 500], clamp);
  const strikerY = interpolate(frame, [0, 100, 145, 175, 210], [430, 430, 390, 340, 340], clamp);

  const leftForwardX = interpolate(frame, [0, 100, 145, 175, 210], [320, 320, 350, 390, 390], clamp);
  const leftForwardY = interpolate(frame, [0, 100, 145, 175, 210], [470, 470, 420, 390, 390], clamp);

  const rightForwardX = interpolate(frame, [0, 100, 145, 175, 210], [580, 580, 550, 520, 520], clamp);
  const rightForwardY = interpolate(frame, [0, 100, 145, 175, 210], [470, 470, 420, 390, 390], clamp);

  const leftMidX = 270 + lateralShift;
  const rightMidX = 630 - lateralShift;

  const leftBackX = 270 + lateralShift * 0.65;
  const rightBackX = 630 - lateralShift * 0.65;

  const showCompact = frame >= 35 && frame < 130;
  const showWide = frame >= 80 && frame < 155;
  const showPress = frame >= 125 && frame < 185;
  const showRegain = frame >= 160 && frame < 195;
  const showTransition = frame >= 180;

  const goalkeeperY = 1090;
  const regainX = interpolate(frame, [160, 185, 210], [620, 480, 360], clamp);
  const regainY = interpolate(frame, [160, 185, 210], [700, 700, 590], clamp);

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
          MID BLOCK
        </div>
        <div style={{ color: "#A9BBCB", fontSize: 25, marginTop: 14 }}>
          STAY COMPACT • DENY THE CENTRE • PRESS TOGETHER
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
            <marker id="midBlockShiftArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
            </marker>
            <marker id="midBlockLaneArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FF8B4A" strokeWidth="2.5" />
            </marker>
            <marker id="midBlockPressArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
            </marker>
            <marker id="midBlockRegainArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            </marker>
          </defs>

          {/* Compact shape shifts as a unit to protect the centre */}
          {showCompact && (
            <>
              <path
                d={`M270 650 Q310 610 ${leftMidX} 650`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="8"
                strokeDasharray="15 12"
                markerEnd="url(#midBlockShiftArrow)"
                opacity={compact}
              />
              <path
                d={`M630 650 Q590 610 ${rightMidX} 650`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="8"
                strokeDasharray="15 12"
                markerEnd="url(#midBlockShiftArrow)"
                opacity={compact}
              />
              <path
                d="M345 600 L555 600"
                fill="none"
                stroke="#FF8B4A"
                strokeWidth="9"
                strokeDasharray="13 11"
                opacity={compact}
              />
            </>
          )}

          {/* Central lanes are screened; opponents are directed toward the flanks */}
          {showWide && (
            <>
              <path
                d="M350 390 L350 650"
                fill="none"
                stroke="#FF8B4A"
                strokeWidth="10"
                strokeDasharray="14 12"
                markerEnd="url(#midBlockLaneArrow)"
                opacity={guideWide}
              />
              <path
                d="M550 390 L550 650"
                fill="none"
                stroke="#FF8B4A"
                strokeWidth="10"
                strokeDasharray="14 12"
                markerEnd="url(#midBlockLaneArrow)"
                opacity={guideWide}
              />
              <path
                d="M450 340 Q620 360 740 470"
                fill="none"
                stroke="#FFD84D"
                strokeWidth="8"
                strokeDasharray="16 12"
                markerEnd="url(#midBlockShiftArrow)"
                opacity={guideWide}
              />
            </>
          )}

          {/* Coordinated press is triggered when the ball enters the block */}
          {showPress && (
            <>
              <path
                d={`M${strikerX} ${strikerY} Q480 470 ${ballX} ${ballY}`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="9"
                strokeDasharray="17 12"
                markerEnd="url(#midBlockPressArrow)"
                opacity={press}
              />
              <path
                d={`M${leftForwardX} ${leftForwardY} Q340 520 ${ballX} ${ballY}`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="8"
                strokeDasharray="15 12"
                markerEnd="url(#midBlockPressArrow)"
                opacity={press}
              />
              <path
                d={`M${rightForwardX} ${rightForwardY} Q560 520 ${ballX} ${ballY}`}
                fill="none"
                stroke="#FFD84D"
                strokeWidth="8"
                strokeDasharray="15 12"
                markerEnd="url(#midBlockPressArrow)"
                opacity={press}
              />
            </>
          )}

          {/* Regain possession and start the transition */}
          {showRegain && (
            <path
              d="M620 700 Q550 740 480 700"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="9"
              strokeDasharray="15 10"
              markerEnd="url(#midBlockRegainArrow)"
              opacity={regain}
            />
          )}
          {showTransition && (
            <path
              d={`M480 700 Q420 650 ${regainX} ${regainY}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeDasharray="14 11"
              markerEnd="url(#midBlockRegainArrow)"
              opacity={transition}
            />
          )}
        </svg>

        <svg viewBox="0 0 900 1250" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* Blue attacking team */}
          <Player x={450} y={155} color="#398BFF" label="ST" />
          <Player x={250} y={250} color="#398BFF" label="LW" />
          <Player x={650} y={250} color="#398BFF" label="RW" />
          <Player x={350} y={360} color="#398BFF" label="CM" />
          <Player x={550} y={360} color="#398BFF" label="CM" />
          <Player x={730} y={470} color="#398BFF" label="FB" />
          <Player x={170} y={470} color="#398BFF" label="FB" />

          {/* Red defending team: compact lines in the middle third */}
          <Player x={450} y={goalkeeperY} color="#F04452" label="GK" scale={0.9} />
          <Player x={leftBackX} y={790} color="#F04452" label="CB" />
          <Player x={390 + lateralShift * 0.25} y={790} color="#F04452" label="CB" />
          <Player x={510 - lateralShift * 0.25} y={790} color="#F04452" label="CB" />
          <Player x={rightBackX} y={790} color="#F04452" label="CB" />

          <Player x={leftMidX} y={625} color="#F04452" label="LM" />
          <Player x={390 + lateralShift * 0.35} y={625} color="#F04452" label="CM" />
          <Player x={510 - lateralShift * 0.35} y={625} color="#F04452" label="CM" />
          <Player x={rightMidX} y={625} color="#F04452" label="RM" />

          <Player x={leftForwardX} y={leftForwardY} color="#F04452" label="ST" scale={1.05} />
          <Player x={strikerX} y={strikerY} color="#F04452" label="ST" scale={1.05} />

          <Ball x={ballX} y={ballY} />
        </svg>
      </div>

      <div style={{ position: "absolute", bottom: 150, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#FFD84D", letterSpacing: 3 }}>
          {phase}
        </div>
        <div style={{ marginTop: 22, fontSize: 22, color: "#B7C6D5" }}>
          RED: MID BLOCK • BLUE: ATTACKING TEAM
        </div>
        <div style={{ marginTop: 14, fontSize: 18, color: "#71869A" }}>
          ILLUSTRATIVE TACTICAL ANIMATION
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MidBlockEntry: React.FC = () => (
  <Composition
    id="MidBlock"
    component={MidBlock}
    durationInFrames={210}
    fps={30}
    width={1080}
    height={1920}
  />
);
