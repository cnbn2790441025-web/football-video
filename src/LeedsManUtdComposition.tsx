import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";


const clips = [
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part1.mp4", from: 0, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part2.mp4", from: 120, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part3.mp4", from: 240, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part4.mp4", from: 360, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part5.mp4", from: 480, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part3.mp4", from: 600, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part4.mp4", from: 720, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part5.mp4", from: 840, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part3.mp4", from: 960, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part4.mp4", from: 1080, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part5.mp4", from: 1200, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part3.mp4", from: 1320, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part4.mp4", from: 1440, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part5.mp4", from: 1560, duration: 100 },
];

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
  { from: 480, duration: 120, type: "press", title: "LEEDS PRESSING", subtitle: "Close passing lanes • force play wide" },
  { from: 600, duration: 120, type: "press", title: "PRESSING TRAP", subtitle: "Compress space • contest second balls" },
  { from: 840, duration: 120, type: "midfield", title: "MIDFIELD BATTLE", subtitle: "Possession • pressure • transitions" },
  { from: 1080, duration: 120, type: "counter", title: "UNITED COUNTER-ATTACK", subtitle: "Win possession • attack open space" },
  { from: 1320, duration: 120, type: "attack", title: "ATTACKING PATTERNS", subtitle: "Wide overloads • forward runs" },
];

const TacticalGraphic: React.FC<{
  type: TacticalType;
  title: string;
  subtitle: string;
}> = ({ type, title, subtitle }) => {
  const frame = useCurrentFrame();
  const pulse = 0.88 + Math.sin(frame / 7) * 0.12;

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
          { x: 100, y: 150, team: "united" }, { x: 230, y: 260, team: "united" },
          { x: 390, y: 170, team: "united" }, { x: 550, y: 250, team: "united" },
          { x: 680, y: 130, team: "united" }, { x: 300, y: 110, team: "leeds" },
          { x: 470, y: 355, team: "leeds" }, { x: 680, y: 365, team: "leeds" },
        ]
      : [
          { x: 100, y: 235, team: "leeds" }, { x: 230, y: 130, team: "leeds" },
          { x: 360, y: 300, team: "leeds" }, { x: 520, y: 140, team: "leeds" },
          { x: 680, y: 245, team: "leeds" }, { x: 280, y: 365, team: "united" },
          { x: 460, y: 365, team: "united" }, { x: 650, y: 110, team: "united" },
        ];

  const arrows =
    type === "press"
      ? [[130,130,240,205],[350,115,470,210],[470,210,610,135]]
      : type === "midfield"
      ? [[240,220,390,150],[390,150,440,235],[440,235,500,300]]
      : type === "counter"
      ? [[100,150,230,260],[230,260,390,170],[390,170,550,250],[550,250,680,130]]
      : [[100,235,230,130],[230,130,520,140],[520,140,680,245],[360,300,680,245]];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "rgba(3,7,16,0.16)" }}>
      <div style={{
        position: "absolute", top: 465, width: 900, height: 820, padding: 28,
        boxSizing: "border-box", borderRadius: 28, overflow: "hidden",
        background: "linear-gradient(145deg, rgba(3,12,24,0.96), rgba(7,29,35,0.94))",
        border: "2px solid rgba(247,217,0,0.72)",
        boxShadow: "0 0 36px rgba(0,0,0,0.42)",
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
          {arrows.map((a, i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]}
              stroke="#F7D900" strokeWidth="5" strokeLinecap="round"
              markerEnd="url(#tacticalArrow)" opacity={pulse} />
          ))}
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

const MatchGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.85 + Math.sin(frame / 8) * 0.15;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(3,7,16,0.48), rgba(3,7,16,0.10) 35%, rgba(3,7,16,0.72))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "48%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(247,217,0,0.22), transparent 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "48%",
          height: "100%",
          background: "linear-gradient(225deg, rgba(218,41,28,0.24), transparent 62%)",
        }}
      />
      <ScoreHeader />
      <div style={{ position: "absolute", top: 260, left: 70, right: 70, textAlign: "center" }}>
        <Text size={26} color={gold} style={{ letterSpacing: 7 }}>PREMIER LEAGUE</Text>
        <Text size={70} style={{ marginTop: 14, textShadow: "0 6px 24px #000" }}>THE BIG MATCH</Text>
      </div>
      <PlayerCard image="leeds-player-2.png" name="BRENDEN AARONSON" team="leeds" side="left" />
      <PlayerCard image="bruno.png" name="BRUNO FERNANDES" team="united" side="right" />
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 60,
          right: 60,
          padding: "24px 20px",
          borderRadius: 18,
          border: `2px solid rgba(255,255,255,${pulse})`,
          background: "rgba(3,7,16,0.84)",
          textAlign: "center",
        }}
      >
        <Text size={42} style={{ fontWeight: 800 }}>LEEDS UNITED <span style={{ color: gold }}>×</span> MANCHESTER UNITED</Text>
        <Text size={22} color="#D8DCE5" style={{ marginTop: 14, letterSpacing: 3 }}>
          18 OCTOBER 2026  •  MATCH PREVIEW
        </Text>
      </div>
    </AbsoluteFill>
  );
};

export const LeedsManUtdComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#030710" }}>
      {clips.filter((clip) => !clip.file.startsWith("ot_fans_atmosphere/")).map((clip) => (
        <Sequence
          key={`${clip.file}-${clip.from}`}
          from={clip.from}
          durationInFrames={clip.duration}
        >
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(`assets/backgrounds/${clip.file}`)}
              startFrom={0}
              endAt={clip.duration}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <AbsoluteFill
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.34), transparent 40%, rgba(0,0,0,0.54))",
              }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence durationInFrames={240}>
        <MatchGraphic />
      </Sequence>
      {tacticalScenes.map((scene) => (
        <Sequence key={`${scene.type}-${scene.from}`} from={scene.from} durationInFrames={scene.duration}>
          <TacticalGraphic type={scene.type} title={scene.title} subtitle={scene.subtitle} />
        </Sequence>
      ))}
      <Audio src={staticFile("leeds-man-utd-narration.mp3")} />
    </AbsoluteFill>
  );
};

export const LeedsManUtdEntry: React.FC = () => (
  <Composition
    id="LeedsManUtd"
    component={LeedsManUtdComposition}
    durationInFrames={1660}
    fps={30}
    width={1080}
    height={1920}
  />
);
