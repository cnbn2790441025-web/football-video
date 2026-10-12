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
  { file: "ot_fans_atmosphere/ot_fans_atmosphere_part1.mp4", from: 240, duration: 120 },
  { file: "ot_fans_atmosphere/ot_fans_atmosphere_part2.mp4", from: 360, duration: 120 },
  { file: "bruno_goal/bruno_goal_part1.mp4", from: 480, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part3.mp4", from: 600, duration: 120 },
  { file: "ot_fans_atmosphere/ot_fans_atmosphere_part3.mp4", from: 720, duration: 120 },
  { file: "bruno_goal/bruno_goal_part2.mp4", from: 840, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part4.mp4", from: 960, duration: 120 },
  { file: "ot_fans_atmosphere/ot_fans_atmosphere_part4.mp4", from: 1080, duration: 120 },
  { file: "bruno_goal/bruno_goal_part3.mp4", from: 1200, duration: 120 },
  { file: "2ot_stadium_intro_fixed/2ot_stadium_intro_part5.mp4", from: 1320, duration: 120 },
  { file: "ot_fans_atmosphere/ot_fans_atmosphere_part5.mp4", from: 1440, duration: 120 },
  { file: "bruno_goal/bruno_goal_part4.mp4", from: 1560, duration: 100 },
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
      {clips.map((clip) => (
        <Sequence
          key={clip.file}
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
      <MatchGraphic />
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
