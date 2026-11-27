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
      <pattern id="counterGrass" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="90" fill="#176B45" />
        <rect y="90" width="180" height="90" fill="#1B754B" />
      </pattern>
    </defs>
    <rect x="5" y="5" width="890" height="1240" rx="12" fill="url(#counterGrass)" stroke="#E8F4EC" strokeWidth="5" />
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

const CounterAttack: React.FC = () => {
  const frame = useCurrentFrame();

  // The recovering midfielder wins possession in the middle third.
  const ballX = interpolate(
    frame,
    [0, 35, 65, 95, 125, 155, 185, 210],
    [450, 450, 450, 390, 330, 420, 545, 450],
    clamp
  );
  const ballY = interpolate(
    frame,
    [0, 35, 65, 95, 125, 155, 185, 210],
    [650, 650, 650, 570, 470, 330, 238, 65],
    clamp
  );

  const carrierX = interpolate(frame, [0, 35, 65, 95, 125, 155], [450, 450, 450, 390, 330, 420], clamp);
  const carrierY = interpolate(frame, [0, 35, 65, 95, 125, 155], [700, 700, 650, 570, 470, 330], clamp);

  const runnerX = interpolate(frame, [0, 55, 95, 135, 175, 210], [650, 650, 620, 580, 550, 535], clamp);
  const runnerY = interpolate(frame, [0, 55, 95, 135, 175, 210], [700, 680, 560, 420, 270, 160], clamp);

  const supportX = interpolate(frame, [0, 65, 110, 155, 210], [250, 250, 300, 365, 420], clamp);
  const supportY = interpolate(frame, [0, 65, 110, 155, 210], [720, 720, 620, 470, 300], clamp);

  const shotX = interpolate(frame, [185, 210], [545, 450], clamp);
  const shotY = interpolate(frame, [185, 210], [238, 65], clamp);

  const showWin = frame >= 20 && frame < 75;
  const showBreak = frame >= 65 && frame < 155;
  const showForwardPass = frame >= 115 && frame < 190;
  const showShot = frame >= 185;

  const winProgress = interpolate(frame, [20, 65], [0, 1], clamp);
  const breakProgress = interpolate(frame, [65, 145], [0, 1], clamp);
  const passProgress = interpolate(frame, [115, 180], [0, 1], clamp);
  const shotProgress = interpolate(frame, [185, 210], [0, 1], clamp);
  const progress = interpolate(frame, [0, 18], [0, 1], clamp);

  const phase =
    frame < 35 ? "WIN THE BALL" :
    frame < 75 ? "QUICK TRANSITION" :
    frame < 145 ? "EXPLOIT THE SPACE" :
    frame < 185 ? "BREAK INTO THE BOX" :
    "FINISH THE ATTACK";

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
          COUNTER ATTACK
        </div>
        <div style={{ color: "#A9BBCB", fontSize: 25, marginTop: 14 }}>
          WIN POSSESSION • TRANSITION FAST • ATTACK THE SPACE
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
        <svg viewBox="0 0 900 1250" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <marker id="counterWinArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
            </marker>
            <marker id="counterBreakArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
            </marker>
            <marker id="counterPassArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            </marker>
            <marker id="counterShotArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FF5B63" strokeWidth="2.5" />
            </marker>
          </defs>

          {/* Recovery and immediate forward transition */}
          {showWin && (
            <path
              d="M450 700 Q430 660 450 650"
              fill="none"
              stroke="#FFD84D"
              strokeWidth="9"
              strokeDasharray="18 13"
              markerEnd="url(#counterWinArrow)"
              opacity={winProgress}
            />
          )}

          {/* Carrier attacks the open central channel */}
          {showBreak && (
            <path
              d={`M450 650 Q410 540 ${carrierX} ${carrierY}`}
              fill="none"
              stroke="#FFD84D"
              strokeWidth="9"
              strokeDasharray="18 13"
              markerEnd="url(#counterBreakArrow)"
              opacity={breakProgress}
            />
          )}

          {/* Forward pass releases the runner into space */}
          {showForwardPass && (
            <path
              d={`M${carrierX} ${carrierY} Q470 390 ${runnerX} ${runnerY}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeDasharray="15 12"
              markerEnd="url(#counterPassArrow)"
              opacity={passProgress}
            />
          )}

          {/* Final shot */}
          {showShot && (
            <path
              d={`M${runnerX} ${runnerY} Q480 120 ${shotX} ${shotY}`}
              fill="none"
              stroke="#FF5B63"
              strokeWidth="9"
              strokeDasharray="15 10"
              markerEnd="url(#counterShotArrow)"
              opacity={shotProgress}
            />
          )}

          {/* Supporting attackers */}
          <Player x={250} y={610} color="#F04452" />
          <Player x={supportX} y={supportY} color="#F04452" />
          <Player x={700} y={500} color="#F04452" />

          {/* Defenders retreating toward their own goal */}
          <Player x={300} y={420} color="#398BFF" />
          <Player x={450} y={390} color="#398BFF" />
          <Player x={600} y={420} color="#398BFF" />
          <Player x={700} y={270} color="#398BFF" />
          <Player x={350} y={260} color="#398BFF" />

          {/* Ball winner, advancing runner and ball */}
          <Player x={carrierX} y={carrierY} color="#F04452" label="M" scale={1.12} />
          <Player x={runnerX} y={runnerY} color="#F04452" label="ST" scale={1.12} />
          <Ball x={ballX} y={ballY} />
        </svg>
      </div>

      <div style={{ position: "absolute", bottom: 150, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#FFD84D", letterSpacing: 3 }}>
          {phase}
        </div>
        <div style={{ marginTop: 22, fontSize: 22, color: "#B7C6D5" }}>
          RED: ATTACKING TEAM • BLUE: DEFENDING TEAM
        </div>
        <div style={{ marginTop: 14, fontSize: 18, color: "#71869A" }}>
          ILLUSTRATIVE TACTICAL ANIMATION
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CounterAttackEntry: React.FC = () => (
  <Composition
    id="CounterAttack"
    component={CounterAttack}
    durationInFrames={210}
    fps={30}
    width={1080}
    height={1920}
  />
);
