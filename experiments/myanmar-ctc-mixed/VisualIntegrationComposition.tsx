import React from "react";
import {
  AbsoluteFill, Audio, Composition, Img, interpolate,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import preview from "./preview-full.json";
import visual from "./visual-integration.json";

type Word = { text: string; start: number; end: number };
type Caption = { id: number; start: number; end: number; text: string; words: Word[] };
type Cue =
  | { kind: "intro"; start: number; end: number }
  | { kind: "player"; name: string; team: "home" | "away"; image: string; role: string; start: number; end: number }
  | { kind: "tactical"; type: string; title: string; subtitle: string; start: number; end: number }
  | { kind: "prediction"; start: number; end: number }
  | { kind: "outro"; startFromEndSeconds: number; durationSeconds: number };

const FPS = preview.fps;
const captions = preview.captions as Caption[];
const cues = visual.cues as Cue[];
const totalFrames = Math.ceil(preview.durationSeconds * FPS);

const fade = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, start + 12, end - 12, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Intro: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity, justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg,#080d19,#26364b)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 54 }}>
      <Img src={staticFile(visual.homeLogo)} style={{ width: 190, height: 190, objectFit: "contain" }} />
      <div style={{ fontSize: 52, fontWeight: 900, color: "#f4c95d" }}>VS</div>
      <Img src={staticFile(visual.awayLogo)} style={{ width: 190, height: 190, objectFit: "contain" }} />
    </div>
    <div style={{ marginTop: 34, fontSize: 48, fontWeight: 900 }}>
      {visual.homeShort} <span style={{ color: "#f4c95d" }}>VS</span> {visual.awayShort}
    </div>
    <div style={{ marginTop: 12, fontSize: 28, color: "#d8deea" }}>MATCH PREVIEW</div>
  </AbsoluteFill>
);

const PlayerCue: React.FC<{ cue: Extract<Cue, { kind: "player" }>; opacity: number }> = ({ cue, opacity }) => (
  <AbsoluteFill style={{ opacity, justifyContent: "flex-end", alignItems: cue.team === "home" ? "flex-start" : "flex-end", padding: "0 28px 90px" }}>
    <div style={{ position: "absolute", inset: 0, background: cue.team === "home" ? "linear-gradient(90deg,rgba(115,12,25,.42),transparent 78%)" : "linear-gradient(270deg,rgba(20,55,105,.42),transparent 78%)" }} />
    <Img src={staticFile(cue.image)} style={{ position: "absolute", bottom: 0, left: cue.team === "home" ? 0 : undefined, right: cue.team === "away" ? 0 : undefined, height: 930, width: 720, objectFit: "contain", objectPosition: "bottom" }} />
    <div style={{ zIndex: 2, marginBottom: 28, padding: "18px 24px", maxWidth: 620, borderRadius: 14, background: "rgba(5,8,18,.88)", border: `2px solid ${cue.team === "home" ? "#e7bd51" : "#72a8e8"}` }}>
      <div style={{ fontSize: 42, fontWeight: 900 }}>{cue.name}</div>
      {cue.role && <div style={{ marginTop: 6, fontSize: 24, fontWeight: 700, color: "#f4c95d" }}>{cue.role}</div>}
      <div style={{ marginTop: 4, fontSize: 19, color: "#d6dbe5" }}>{cue.team === "home" ? visual.homeTeam : visual.awayTeam}</div>
    </div>
  </AbsoluteFill>
);

const TacticalCue: React.FC<{ cue: Extract<Cue, { kind: "tactical" }>; opacity: number }> = ({ cue, opacity }) => (
  <AbsoluteFill style={{ opacity, justifyContent: "center", alignItems: "center", padding: 55 }}>
    <div style={{ width: "100%", padding: 30, borderRadius: 22, background: "rgba(5,12,22,.92)", border: "2px solid rgba(244,201,93,.85)" }}>
      <div style={{ fontSize: 34, fontWeight: 900, textAlign: "center", color: "#f4c95d", marginBottom: 18 }}>{cue.title}</div>
      <svg viewBox="0 0 900 430" width="100%">
        <rect x="35" y="25" width="830" height="380" rx="8" fill="#174c3c" stroke="#f4f0d8" strokeWidth="5" />
        <line x1="450" y1="25" x2="450" y2="405" stroke="#f4f0d8" strokeWidth="4" />
        <circle cx="450" cy="215" r="76" fill="none" stroke="#f4f0d8" strokeWidth="4" />
        <rect x="35" y="115" width="125" height="200" fill="none" stroke="#f4f0d8" strokeWidth="4" />
        <rect x="740" y="115" width="125" height="200" fill="none" stroke="#f4f0d8" strokeWidth="4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <circle key={i} cx={cue.type === "low-block" ? 260 + (i % 2) * 70 : 270 + (i % 2) * 90} cy={105 + i * 55} r="17" fill="#f4c95d" stroke="#fff" strokeWidth="3" />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <circle key={i} cx={cue.type === "attack" ? 600 + (i % 2) * 65 : 610 + (i % 2) * 55} cy={130 + i * 85} r="17" fill="#e7edf8" stroke="#15243a" strokeWidth="3" />
        ))}
        <path d={cue.type === "attack" ? "M 480 215 Q 570 130 690 190 T 800 215" : "M 490 215 Q 570 215 650 215"} fill="none" stroke="#ffdf72" strokeWidth="9" strokeLinecap="round" strokeDasharray="16 12" />
      </svg>
      <div style={{ marginTop: 14, fontSize: 24, color: "white", textAlign: "center" }}>{cue.subtitle}</div>
    </div>
  </AbsoluteFill>
);

const PredictionCue: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity, justifyContent: "center", alignItems: "center", background: "rgba(4,8,18,.94)" }}>
    <div style={{ fontSize: 28, color: "#f4c95d", fontWeight: 800, letterSpacing: 4 }}>MATCH PREDICTION</div>
    <div style={{ marginTop: 28, fontSize: 62, color: "white", fontWeight: 900, textAlign: "center" }}>{visual.prediction}</div>
  </AbsoluteFill>
);

const OutroCue: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity, justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg,#090d18,#26364a)" }}>
    <div style={{ fontSize: 58, color: "#f4c95d", fontWeight: 900 }}>FULL TIME</div>
    <div style={{ marginTop: 22, fontSize: 34, color: "white", fontWeight: 700 }}>{visual.homeTeam} · {visual.awayTeam}</div>
  </AbsoluteFill>
);

const PreviewVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const time = frame / FPS;
  const caption = captions.find(c => time >= c.start && time < c.end) ?? captions[captions.length - 1];
  const cue = cues.find(c => c.kind !== "outro" && time >= c.start && time < c.end);
  const outro = cues.find(c => c.kind === "outro") as Extract<Cue, { kind: "outro" }>;
  const outroStart = durationInFrames - Math.round(outro.durationSeconds * FPS);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(145deg,#101018,#20283a 55%,#080808)", color: "white", fontFamily: "Noto Sans Myanmar", overflow: "hidden" }}>
      <style>{`
        @font-face { font-family: "Noto Sans Myanmar"; src: url("${staticFile("fonts/NotoSansMyanmar-Regular.woff2")}") format("woff2"); font-weight: 400; }
        @font-face { font-family: "Noto Sans Myanmar"; src: url("${staticFile("fonts/NotoSansMyanmar-Bold.woff2")}") format("woff2"); font-weight: 700; }
      `}</style>
      <Audio src={staticFile(preview.audio)} />
      {cue?.kind === "intro" && <Intro opacity={fade(frame, cue.start * FPS, cue.end * FPS)} />}
      {cue?.kind === "player" && <PlayerCue cue={cue} opacity={fade(frame, cue.start * FPS, cue.end * FPS)} />}
      {cue?.kind === "tactical" && <TacticalCue cue={cue} opacity={fade(frame, cue.start * FPS, cue.end * FPS)} />}
      {cue?.kind === "prediction" && <PredictionCue opacity={fade(frame, cue.start * FPS, cue.end * FPS)} />}
      {frame >= outroStart && <OutroCue opacity={interpolate(frame, [outroStart, outroStart + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />}

      <div style={{ position: "absolute", top: 500, left: 65, right: 65, padding: "28px 26px", backgroundColor: "rgba(5,8,18,0.9)", borderRadius: 18, border: "2px solid rgba(255,190,30,0.75)", textAlign: "center", fontSize: 46, fontWeight: 700, lineHeight: 1.9, zIndex: 10 }}>
        {caption.words.map((word, index) => {
          const active = time >= word.start && time < word.end;
          return <React.Fragment key={`${caption.id}-${index}`}>
            <span style={{ color: active ? "#111111" : "#FFFFFF", backgroundColor: active ? "#FFD84D" : "transparent", borderRadius: 7, padding: active ? "2px 5px" : "0", textShadow: active ? "none" : "0 2px 4px #000000" }}>{word.text}</span>
            {index < caption.words.length - 1 ? " " : ""}
          </React.Fragment>;
        })}
      </div>
    </AbsoluteFill>
  );
};

export const MyanmarCtcVisualIntegration: React.FC = () => (
  <Composition id="MyanmarCtcVisualIntegration" component={PreviewVideo} durationInFrames={totalFrames} fps={FPS} width={1080} height={1920} />
);
