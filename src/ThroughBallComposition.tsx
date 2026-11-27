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
      <pattern id="throughGrass" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="90" fill="#176B45" />
        <rect y="90" width="180" height="90" fill="#1B754B" />
      </pattern>
    </defs>
    <rect x="5" y="5" width="890" height="1240" rx="12"
      fill="url(#throughGrass)" stroke="#E8F4EC" strokeWidth="5" />
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

const ThroughBallAttack: React.FC = () => {
  const frame = useCurrentFrame();

  // Attacking runner accelerates into the space behind the defensive line.
  const runnerX = interpolate(frame, [0, 45, 90, 135, 180, 210], [450, 450, 490, 535, 570, 590], clamp);
  const runnerY = interpolate(frame, [0, 45, 90, 135, 180, 210], [760, 700, 570, 420, 280, 220], clamp);

  // Midfielder remains the passer and releases the ball during phase three.
  const passerX = 330;
  const passerY = 760;

  // Ball travels diagonally into the channel for the runner.
  const ballX = interpolate(frame, [0, 90, 112, 145, 180, 210], [330, 330, 390, 500, 570, 590], clamp);
  const ballY = interpolate(frame, [0, 90, 112, 145, 180, 210], [760, 760, 650, 440, 280, 220], clamp);

  const showRun = frame >= 35 && frame < 150;
  const showPass = frame >= 105;
  const passProgress = interpolate(frame, [105, 180], [0, 1], clamp);
  const runnerProgress = interpolate(frame, [35, 165], [0, 1], clamp);
  const progress = interpolate(frame, [0, 18], [0, 1], clamp);

  const phase =
    frame < 35 ? "BUILD THE ATTACK" :
    frame < 105 ? "STRIKER RUNS BEHIND" :
    frame < 180 ? "THROUGH BALL INTO SPACE" :
    "ATTACKER REACHES THE BALL";

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
          THROUGH BALL ATTACK
        </div>
        <div style={{ color: "#A9BBCB", fontSize: 25, marginTop: 14 }}>
          PASS INTO SPACE BEHIND THE DEFENSIVE LINE
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
            <marker id="throughRunArrow" markerWidth="8" markerHeight="8"
              refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFD84D" strokeWidth="2.5" />
            </marker>
            <marker id="throughPassArrow" markerWidth="8" markerHeight="8"
              refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M4 1 L7 4 L4 7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            </marker>
          </defs>

          {/* Runner's movement into the space behind the defensive line */}
          {showRun && (
            <path
              d={`M450 760 Q420 590 ${runnerX} ${runnerY}`}
              fill="none"
              stroke="#FFD84D"
              strokeWidth="9"
              strokeDasharray="18 13"
              markerEnd="url(#throughRunArrow)"
              opacity={runnerProgress}
            />
          )}

          {/* Passing lane appears as the ball is released */}
          {showPass && (
            <path
              d={`M${passerX} ${passerY} Q350 520 ${ballX} ${ballY}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeDasharray="15 12"
              markerEnd="url(#throughPassArrow)"
              opacity={passProgress}
            />
          )}

          {/* Supporting attackers */}
          <Player x={250} y={610} color="#F04452" />
          <Player x={600} y={650} color="#F04452" />
          <Player x={700} y={500} color="#F04452" />

          {/* Defending line */}
          <Player x={300} y={420} color="#398BFF" />
          <Player x={450} y={390} color="#398BFF" />
          <Player x={600} y={420} color="#398BFF" />
          <Player x={700} y={270} color="#398BFF" />
          <Player x={350} y={260} color="#398BFF" />

          {/* Passer and striker */}
          <Player x={passerX} y={passerY} color="#F04452" label="M" scale={1.12} />
          <Player x={runnerX} y={runnerY} color="#F04452" label="ST" scale={1.12} />

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
          RED: ATTACKING TEAM • BLUE: DEFENDING TEAM
        </div>
        <div style={{ marginTop: 14, fontSize: 18, color: "#71869A" }}>
          ILLUSTRATIVE TACTICAL ANIMATION
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ThroughBallAttackEntry: React.FC = () => (
  <Composition
    id="ThroughBallAttack"
    component={ThroughBallAttack}
    durationInFrames={210}
    fps={30}
    width={1080}
    height={1920}
  />
);
