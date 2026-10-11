
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";

const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(145deg, #100000, #480707 48%, #080808)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("narration-full.mp3")} />
      {Array.from({ length: 5 }, (_, i) => (
        <Sequence key={i} from={i * 120} durationInFrames={45}>
          <OffthreadVideo
            src={staticFile(`assets/backgrounds/2ot_stadium_intro_fixed/2ot_stadium_intro_part${i + 1}.mp4`)}
            startFrom={0}
            endAt={120}
            muted
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.7,
              filter: "brightness(0.8)",
            }}
          />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(255,0,0,.28), transparent 65%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 90,
          width: "100%",
          textAlign: "center",
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 7,
          color: "#ffcccc",
        }}
      >
        THE BIG MATCH
      </div>

      <div
        style={{
          position: "absolute",
          top: 190,
          left: 250,
          width: 580,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Img
          src={staticFile("assets/logos/manutd.png")}
          style={{ width: 155, height: 155, objectFit: "contain" }}
        />
        <div style={{ fontSize: 46, fontWeight: 900, color: "#ff3333" }}>
          VS
        </div>
        <Img
          src={staticFile("assets/logos/arsenal.png")}
          style={{ width: 155, height: 155, objectFit: "contain" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 390,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontSize: 49,
          fontWeight: 900,
          letterSpacing: 2,
        }}
      >
        MAN UNITED
        <div style={{ color: "#ff4242", marginTop: 12 }}>VS ARSENAL</div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 590,
          left: 35,
          width: 1010,
          height: 850,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
        }}
      >
        <Img
          src={staticFile("assets/players/bruno.png")}
          style={{
            width: 500,
            height: 820,
            objectFit: "contain",
            objectPosition: "bottom",
            opacity: fade,
          }}
        />
        <Img
          src={staticFile("assets/players/saka.png")}
          style={{
            width: 500,
            height: 820,
            objectFit: "contain",
            objectPosition: "bottom",
            opacity: fade,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 160,
          width: "100%",
          textAlign: "center",
          fontSize: 25,
          fontWeight: 800,
          letterSpacing: 4,
          color: "#ffcccc",
        }}
      >
        MATCH PREVIEW • TACTICS • PREDICTION
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: 880,
          height: 5,
          background: "#555",
        }}
      >
        <div
          style={{
            width: `${(frame / 1799) * 100}%`,
            height: "100%",
            background: "#ff2525",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => (
  <Composition
    id="MyComp"
    component={MyComponent}
    durationInFrames={1800}
    fps={30}
    width={1080}
    height={1920}
  />
);
