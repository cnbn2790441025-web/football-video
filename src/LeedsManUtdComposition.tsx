import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";




const gold = "#F7D900";
const red = "#DA291C";

const Text: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 48, color = "#FFFFFF", weight = 900, style }) => (
  <div
    style={{
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.05,
      letterSpacing: -1,
      ...style,
    }}
  >
    {children}
  </div>
);

const PlayerCard: React.FC<{
  image: string;
  name: string;
  team: "leeds" | "united";
  side: "left" | "right";
}> = ({ image, name, team, side }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 18], [70, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const accent = team === "leeds" ? gold : red;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 260,
        [side]: 10,
        width: 510,
        height: 790,
        transform: `translateY(${enter}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "8% 4% 0",
          background: `linear-gradient(180deg, ${accent}00 0%, ${accent}30 65%, ${accent}A0 100%)`,
          clipPath: "polygon(16% 0,100% 8%,86% 100%,0 88%)",
        }}
      />
      <Img
        src={staticFile(`assets/players/${image}`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "bottom center",
          filter: `drop-shadow(0 0 18px ${accent}55)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 18,
          right: 18,
          padding: "16px 12px",
          textAlign: "center",
          background: `linear-gradient(90deg, ${accent}00, ${accent}E8, ${accent}00)`,
        }}
      >
        <Text size={32} color={team === "leeds" ? "#111111" : "#FFFFFF"}>
          {name}
        </Text>
      </div>
    </div>
  );
};

const ScoreHeader: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 70,
      left: 65,
      right: 65,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "22px 28px",
      background: "rgba(5,8,16,0.78)",
      border: "2px solid rgba(255,255,255,0.28)",
      borderRadius: 18,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Img src={staticFile("assets/logos/leeds.png")} style={{ width: 92, height: 92, objectFit: "contain" }} />
      <Text size={30} style={{ fontWeight: 800 }}>LEEDS</Text>
    </div>
    <div style={{ textAlign: "center" }}>
      <Text size={34} color={gold}>VS</Text>
      <Text size={18} color="#D8DCE5" style={{ marginTop: 7, letterSpacing: 3 }}>MATCH PREVIEW</Text>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <Text size={30} style={{ fontWeight: 800 }}>MAN UTD</Text>
      <Img src={staticFile("assets/logos/manutd.png")} style={{ width: 92, height: 92, objectFit: "contain" }} />
    </div>
  </div>
);


type TacticalType = "press" | "midfield" | "counter" | "attack";

const tacticalScenes: {
  from: number;
  duration: number;
  type: TacticalType;
  title: string;
  subtitle: string;
}[] = [
  { from: 489, duration: 171, type: "press", title: "LEEDS PRESSING", subtitle: "Close passing lanes • force play wide" },
  { from: 660, duration: 210, type: "attack", title: "MAN UTD ATTACK", subtitle: "Create chances • exploit attacking space" },
  { from: 870, duration: 306, type: "midfield", title: "MIDFIELD BATTLE", subtitle: "Possession • pressure • transitions" },
  { from: 1176, duration: 249, type: "counter", title: "UNITED COUNTER-ATTACK", subtitle: "Win possession • attack open space" },
];

const TacticalGraphic: React.FC<{
  type: TacticalType;
  title: string;
  subtitle: string;
}> = ({ type, title, subtitle }) => {
  const frame = useCurrentFrame();
  const pulse = 0.88 + Math.sin(frame / 7) * 0.12;
  const zoom = interpolate(frame, [0, 90], [1, 1.06], { extrapolateRight: "clamp" });
  const zoomDrop = (zoom - 1) * 410;

  const dots: { x: number; y: number; team: "leeds" | "united"; label?: string }[] =
    type === "press"
      ? [
          { x: 130, y: 130, team: "leeds" }, { x: 240, y: 205, team: "leeds" },
          { x: 350, y: 115, team: "leeds" }, { x: 470, y: 210, team: "leeds" },
          { x: 610, y: 135, team: "united" }, { x: 700, y: 240, team: "united" },
          { x: 555, y: 340, team: "united" }, { x: 720, y: 395, team: "united" },
        ]
      : type === "midfield"
      ? [
          { x: 130, y: 110, team: "leeds" }, { x: 240, y: 220, team: "leeds" },
          { x: 390, y: 150, team: "leeds" }, { x: 500, y: 300, team: "leeds" },
          { x: 300, y: 340, team: "united" }, { x: 440, y: 235, team: "united" },
          { x: 600, y: 160, team: "united" }, { x: 710, y: 340, team: "united" },
        ]
      : type === "counter"
      ? [
          { x: 700, y: 130, team: "united" }, { x: 620, y: 250, team: "united" },
          { x: 500, y: 170, team: "united" }, { x: 380, y: 260, team: "united" },
          { x: 250, y: 190, team: "united" }, { x: 520, y: 100, team: "leeds" },
          { x: 390, y: 355, team: "leeds" }, { x: 230, y: 330, team: "leeds" },
        ]
      : [
          { x: 700, y: 245, team: "united" }, { x: 600, y: 130, team: "united" },
          { x: 500, y: 300, team: "united" }, { x: 390, y: 160, team: "united" },
          { x: 260, y: 235, team: "united" }, { x: 560, y: 110, team: "leeds" },
          { x: 430, y: 365, team: "leeds" }, { x: 300, y: 350, team: "leeds" },
        ];

  const arrows =
    type === "press"
      ? [[130,130,240,205],[350,115,470,210],[470,210,610,135]]
      : type === "midfield"
      ? [[240,220,390,150],[390,150,440,235],[440,235,500,300]]
      : type === "counter"
      ? [[700,130,620,250],[620,250,500,170],[500,170,380,260],[380,260,180,220]]
      : [[700,245,600,130],[600,130,390,160],[390,160,260,235],[500,300,260,235]];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "rgba(3,7,16,0.16)" }}>
      <div style={{
        position: "absolute", top: 465, width: 900, height: 820, padding: 28,
        boxSizing: "border-box", borderRadius: 28, overflow: "hidden",
        background: "linear-gradient(145deg, rgba(3,12,24,0.96), rgba(7,29,35,0.94))",
        border: "2px solid rgba(247,217,0,0.72)",
        boxShadow: "0 0 36px rgba(0,0,0,0.42)",
        transform: `translateY(${zoomDrop}px) scale(${zoom})`,
        transformOrigin: "center top",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#F7D900", fontSize: 22, fontWeight: 900, letterSpacing: 3 }}>TACTICAL BOARD</div>
          <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 800 }}>LEEDS · MAN UTD</div>
        </div>
        <div style={{ color: "#FFFFFF", fontSize: 36, fontWeight: 900, marginTop: 18, lineHeight: 1.1 }}>{title}</div>
        <div style={{ color: "#D8E2EA", fontSize: 21, marginTop: 10 }}>{subtitle}</div>
        <svg viewBox="0 0 840 470" style={{ width: "100%", marginTop: 24, display: "block" }}>
          <defs>
            <marker id="tacticalArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#F7D900" />
            </marker>
          </defs>
          <rect x="2" y="2" width="836" height="466" rx="16" fill="#0A493A" stroke="#D5E8DC" strokeWidth="3" />
          <line x1="420" y1="3" x2="420" y2="467" stroke="#D5E8DC" strokeWidth="2" opacity="0.8" />
          <circle cx="420" cy="235" r="68" fill="none" stroke="#D5E8DC" strokeWidth="2" opacity="0.8" />
          <circle cx="420" cy="235" r="4" fill="#D5E8DC" />
          <rect x="2" y="125" width="105" height="220" fill="none" stroke="#D5E8DC" strokeWidth="2" />
          <rect x="733" y="125" width="105" height="220" fill="none" stroke="#D5E8DC" strokeWidth="2" />
          <rect x="2" y="185" width="38" height="100" fill="none" stroke="#D5E8DC" strokeWidth="2" />
          <rect x="800" y="185" width="38" height="100" fill="none" stroke="#D5E8DC" strokeWidth="2" />
          {arrows.map((a, i) => {
            const x1 = a[0], y1 = a[1], x2 = a[2], y2 = a[3];
            const dx = x2 - x1, dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const progress = ((frame * 1.8 + i * 24) % 100) / 100;
            const ballX = x1 + dx * progress;
            const ballY = y1 + dy * progress;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#F7D900" strokeWidth="5" strokeLinecap="round"
                  markerEnd="url(#tacticalArrow)" opacity={pulse} />
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${Math.max(18, length * 0.22)} ${length}`}
                  strokeDashoffset={-frame * 2.8 + i * 12}
                  opacity="0.95" />
                <circle cx={ballX} cy={ballY} r="7"
                  fill="#FFFFFF" stroke="#F7D900" strokeWidth="3" />
              </g>
            );
          })}
          {dots.map((d, i) => (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r="19"
                fill={d.team === "leeds" ? "#F7D900" : "#DA291C"}
                stroke="#FFFFFF" strokeWidth="3" />
              <circle cx={d.x} cy={d.y} r="5" fill={d.team === "leeds" ? "#17212B" : "#FFFFFF"} />
            </g>
          ))}
          <text x="26" y="40" fill="#FFFFFF" fontSize="18" fontWeight="800">LEEDS</text>
          <text x="690" y="40" fill="#FFFFFF" fontSize="18" fontWeight="800">UNITED</text>
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, color: "#D8E2EA", fontSize: 17 }}>
          <span><span style={{ color: "#F7D900" }}>●</span> Leeds United</span>
          <span><span style={{ color: "#DA291C" }}>●</span> Manchester United</span>
        </div>
        <div style={{ marginTop: 14, color: "#9FB0BF", fontSize: 14, letterSpacing: 1 }}>
          ILLUSTRATIVE TACTICAL CONCEPT · NOT LIVE MATCH TRACKING
        </div>
      </div>
    </AbsoluteFill>
  );
};


const StadiumBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const cycle = frame % 300;
  const blueX = interpolate(cycle, [0, 150, 300], [-1188, 1188, -1188]);
  const redX = interpolate(cycle, [0, 150, 300], [1188, -1188, 1188]);
  const pulse = interpolate(frame % 180, [0, 45, 90, 135, 180], [0.35, 0.75, 0.4, 0.7, 0.35]);

  const beam: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "125%",
    height: 12,
    borderRadius: 999,
    filter: "blur(7px)",
    pointerEvents: "none",
    mixBlendMode: "screen",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712", overflow: "hidden" }}>
      <Img
        src={staticFile("assets/stadium-light-motion-bg.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(24px) brightness(0.38) saturate(1.25)",
          transform: "scale(1.15)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 12% 24%, rgba(0,105,255,${pulse * 0.65}), transparent 48%), radial-gradient(ellipse at 88% 72%, rgba(255,20,55,${pulse * 0.5}), transparent 48%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <Img
        src={staticFile("assets/stadium-light-motion-bg.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
      <div
        style={{
          ...beam,
          top: "18%",
          height: 10,
          background: "linear-gradient(90deg, transparent 5%, rgba(0,90,255,0.1) 25%, rgba(45,145,255,0.95) 48%, rgba(100,190,255,0.65) 52%, transparent 78%)",
          boxShadow: "0 0 24px 8px rgba(0,110,255,0.32)",
          transform: `translateX(${blueX}px) rotate(-17deg)`,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          ...beam,
          top: "46%",
          height: 6,
          background: "linear-gradient(90deg, transparent 8%, rgba(20,105,255,0.08) 30%, rgba(70,165,255,0.65) 48%, rgba(125,205,255,0.35) 54%, transparent 82%)",
          boxShadow: "0 0 20px 5px rgba(0,115,255,0.18)",
          transform: `translateX(${blueX * 0.65}px) rotate(-12deg)`,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          ...beam,
          top: "74%",
          height: 9,
          background: "linear-gradient(90deg, transparent 8%, rgba(255,25,55,0.12) 28%, rgba(255,40,65,0.95) 50%, rgba(255,125,135,0.6) 55%, transparent 82%)",
          boxShadow: "0 0 24px 8px rgba(255,20,55,0.3)",
          transform: `translateX(${redX}px) rotate(-17deg)`,
          opacity: 0.85,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(112deg, transparent 20%, rgba(25,115,255,${pulse * 0.16}) 43%, rgba(255,255,255,${pulse * 0.08}) 49%, transparent 67%)`,
          transform: `translateX(${blueX * 0.55}px)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(30,100,255,0.15), transparent 22%, transparent 72%, rgba(255,25,50,0.12))",
          boxShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(35,105,255,0.12)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

const PersistentHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.72 + Math.sin(frame / 13) * 0.16;
const lift = Math.sin(frame / 30) * 3;
const headerOpacity = interpolate(
  frame,
  [0, 18, 222, 240],
  [0, 0, 0, 1],
  {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
);
// Date and kickoff animation: narration around 11.2s–16.3s
const dateProgress = interpolate(frame, [336, 350, 475, 489], [0, 1, 1, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const dateScale = 1 + dateProgress * 0.12;

const dateColor = interpolate(
  Math.sin(frame / 5),
  [-1, 1],
  [0, 1],
);

const dateSweepX = interpolate(
  frame,
  [336, 489],
  [-180, 180],
  {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
);

return (
    <AbsoluteFill
  style={{
    pointerEvents: "none",
    opacity: headerOpacity,
  }}
>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(247,217,0,0.12), transparent 44%, rgba(218,41,28,0.12))",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 410, opacity: glow,
        background: "linear-gradient(180deg, rgba(2,7,17,0.52), transparent)",
      }} />
      <div style={{ transform: `translateY(${lift}px)` }}>
        <ScoreHeader />
      </div>
      <div style={{
        position: "absolute", top: 260, left: 45, right: 45,
        textAlign: "center", transform: `translateY(${lift * 0.5}px)`,
      }}>
        <Text size={26} color={gold} style={{
          letterSpacing: 7, textShadow: "0 0 18px rgba(247,217,0,0.65)",
        }}>PREMIER LEAGUE</Text>
        <Text size={70} style={{
          marginTop: 14, textShadow: "0 6px 24px #000, 0 0 22px rgba(247,217,0,0.24)",
        }}>THE BIG MATCH</Text>
        <Text size={34} style={{
        marginTop: 18,
        letterSpacing: 3,
        color: `rgb(255, ${Math.round(190 - dateColor * 150)}, ${Math.round(35 + dateColor * 20)})`,
        textShadow: `0 0 ${12 + dateProgress * 24}px rgba(255,215,0,${0.6 + dateProgress * 0.4})`,
        transform: `scale(${dateScale})`,
       }}>
       OCTOBER 18 • SUNDAY
       </Text>
       <Text size={42} style={{
       marginTop: 8,
       letterSpacing: 2,
       color: `rgb(255, ${Math.round(205 - dateColor * 165)}, ${Math.round(65 - dateColor * 30)})`,
       textShadow: `0 0 ${14 + dateProgress * 26}px rgba(255,215,0,${0.6 + dateProgress * 0.4})`,
       transform: `scale(${dateScale})`,
       }}>
       7:30 PM (MMT)
       </Text>
       </div>
     
<div
  style={{
    position: "absolute",
    top: 390,
    left: `calc(50% + ${dateSweepX}px)`,
    width: 100,
    height: 100,
    opacity: dateProgress * 0.8,
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), rgba(255,215,0,0.5), transparent)",
    filter: "blur(8px)",
    transform: "translateX(-50%) skewX(-20deg)",
    pointerEvents: "none",
  }}
/>
    </AbsoluteFill>
  );
};


const MatchGraphic: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 12, 28], [0, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flash = interpolate(frame, [0, 2, 7, 13], [0, 0.9, 0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const vsScale = interpolate(frame, [8, 17, 25], [0.2, 1.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sweepX = interpolate(frame, [0, 45], [-900, 1100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(30,50,85,0.42), transparent 62%), linear-gradient(180deg, transparent 20%, rgba(2,7,17,0.25) 55%, rgba(2,7,17,0.82))",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 500,
          left: 0,
          right: 0,
          height: 8,
          opacity: 0.8,
          background:
            "linear-gradient(90deg, transparent, #F7D900, #FFFFFF, #DA291C, transparent)",
          transform: `translateX(${sweepX}px)`,
          boxShadow: "0 0 28px rgba(255,255,255,0.7)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(255,255,255,${flash})`,
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 500,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: enter,
          transform: `scale(${0.94 + enter * 0.06})`,
        }}
      >
        <Text
          size={32}
          color="#D8DCE5"
          style={{ letterSpacing: 8, textShadow: "0 0 18px #000" }}
        >
          PREMIER LEAGUE
        </Text>

        <Text
          size={68}
          style={{
            marginTop: 18,
            letterSpacing: 2,
            textShadow: "0 5px 25px #000, 0 0 24px rgba(255,255,255,0.25)",
          }}
        >
          LEEDS UNITED
        </Text>

        <Text
          size={54}
          color={gold}
          style={{
            marginTop: 12,
            textShadow: "0 0 25px rgba(247,217,0,0.7)",
          }}
        >
          VS
        </Text>

        <Text
          size={68}
          style={{
            marginTop: 12,
            textShadow: "0 5px 25px #000, 0 0 24px rgba(218,41,28,0.4)",
          }}
        >
          MANCHESTER UNITED
        </Text>
      </div>

      <div
        style={{
          position: "absolute",
          top: 940,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 44,
          transform: `scale(${vsScale})`,
        }}
      >
        <Img
          src={staticFile("assets/logos/leeds.png")}
          style={{
            width: 210,
            height: 210,
            objectFit: "contain",
            filter: "drop-shadow(0 0 28px rgba(247,217,0,0.55))",
          }}
        />

        <Text
          size={74}
          color="#FFFFFF"
          style={{
            fontStyle: "italic",
            textShadow: "0 0 28px rgba(255,255,255,0.75)",
          }}
        >
          VS
        </Text>

        <Img
          src={staticFile("assets/logos/manutd.png")}
          style={{
            width: 210,
            height: 210,
            objectFit: "contain",
            filter: "drop-shadow(0 0 28px rgba(218,41,28,0.65))",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: 50,
          right: 50,
          padding: "22px 18px",
          borderRadius: 18,
          border: "2px solid rgba(255,255,255,0.5)",
          background: "rgba(3,7,16,0.82)",
          textAlign: "center",
          opacity: interpolate(frame, [18, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          boxShadow: "0 0 32px rgba(0,0,0,0.5)",
        }}
      >
        <Text size={28} color="#FFD36A" style={{ letterSpacing: 4 }}>
          MATCHDAY PREVIEW
        </Text>
        <Text
          size={23}
          color="#D8DCE5"
          style={{ marginTop: 14, letterSpacing: 2 }}
        >
          18 OCTOBER 2026
        </Text>
      </div>
    </AbsoluteFill>
  );
};


const PredictionGraphic: React.FC = () => {
const frame = useCurrentFrame();

const progress = interpolate(frame, [0, 12, 75, 84], [0, 1, 1, 0], {
extrapolateLeft: "clamp",
extrapolateRight: "clamp",
});

const scale = interpolate(frame, [0, 12], [0.7, 1], {
extrapolateLeft: "clamp",
extrapolateRight: "clamp",
});

const sweep = ((frame * 14) % 700) - 350;

return (
<AbsoluteFill
style={{
justifyContent: "center",
alignItems: "center",
opacity: progress,
transform: `scale(${scale})`,
}}
>
<div
style={{
width: "86%",
padding: "38px 20px",
borderRadius: 24,
border: "2px solid rgba(255,190,60,0.9)",
background: "linear-gradient(135deg, rgba(20,4,10,0.96), rgba(3,7,16,0.96))",
textAlign: "center",
boxShadow: "0 0 35px rgba(255,50,35,0.45)",
overflow: "hidden",
}}
>
<Text
size={32}
style={{
color: "#FFD36A",
letterSpacing: 5,
textShadow: "0 0 20px rgba(255,190,60,0.9)",
}}
>
MATCH PREDICTION
</Text>

    <div
      style={{
        height: 4,
        margin: "26px auto",
        width: "75%",
        background: `linear-gradient(90deg, transparent, #FF3434, #FFD36A, transparent)`,
        transform: `translateX(${sweep}px)`,
      }}
    />

    <Text
      size={42}
      style={{
        color: "#FFFFFF",
        fontWeight: 900,
        letterSpacing: 2,
        textShadow: "0 0 22px rgba(255,45,45,0.95)",
      }}
    >
      MANCHESTER UNITED WIN
    </Text>
  </div>
</AbsoluteFill>

);
};

export const LeedsManUtdComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#030710" }}>
      <StadiumBackground />
      <PersistentHeader />
      <Sequence durationInFrames={240}>
        <MatchGraphic />
      </Sequence>
      {tacticalScenes.map((scene) => (
        <Sequence key={`${scene.type}-${scene.from}`} from={scene.from} durationInFrames={scene.duration}>
          <TacticalGraphic type={scene.type} title={scene.title} subtitle={scene.subtitle} />
        </Sequence>
      ))}
      <Sequence from={1425} durationInFrames={84}>
        <PredictionGraphic />
      </Sequence>
      <Audio src={staticFile("leeds-man-utd-narration.mp3")} />
    </AbsoluteFill>
  );
};
export const LeedsManUtdEntry: React.FC = () => (
  <Composition
    id="LeedsManUtd"
    component={LeedsManUtdComposition}
    durationInFrames={1650}
    fps={30}
    width={1080}
    height={1920}
  />
);
