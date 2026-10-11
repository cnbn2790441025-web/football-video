import React from "react";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { LeedsManUtdComposition } from "./LeedsManUtdComposition";

const OutroGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, 270, 290], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [0, 20], [35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #183b32 0%, #071610 45%, #020609 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "9% 7%",
          border: "3px solid rgba(255,255,255,0.8)",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          top: "50%",
          borderTop: "2px solid rgba(255,255,255,0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 270,
          height: 270,
          border: "2px solid rgba(255,255,255,0.7)",
          borderRadius: "50%",
          top: "calc(50% - 135px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "48%",
          height: "16%",
          border: "2px solid rgba(255,255,255,0.65)",
          top: "9%",
          left: "26%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "48%",
          height: "16%",
          border: "2px solid rgba(255,255,255,0.65)",
          bottom: "9%",
          left: "26%",
        }}
      />

      <div
        style={{
          zIndex: 2,
          width: "86%",
          textAlign: "center",
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            color: "#d8e4dc",
            fontWeight: 700,
          }}
        >
          MATCH PREDICTION
        </div>
        <div
          style={{
            marginTop: 35,
            fontSize: 48,
            fontWeight: 900,
            color: "#f7d46a",
            textShadow: "0 4px 24px rgba(0,0,0,0.65)",
          }}
        >
          LEEDS UNITED
        </div>
        <div style={{ fontSize: 62, fontWeight: 900, marginTop: 8 }}>
          1 — 2
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "#e9e9ee",
            marginTop: 8,
          }}
        >
          MAN UNITED
        </div>
        <div
          style={{
            marginTop: 65,
            padding: "24px 18px",
            background: "#f7d46a",
            color: "#071610",
            borderRadius: 14,
            fontSize: 34,
            fontWeight: 900,
          }}
        >
          WHAT'S YOUR PREDICTION?
        </div>
        <div
          style={{
            fontSize: 25,
            marginTop: 22,
            color: "#e1e8e3",
            letterSpacing: 2,
          }}
        >
          COMMENT BELOW
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LeedsManUtdTikTokComposition: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#020609" }}>
    <Sequence from={0} durationInFrames={1660}>
      <LeedsManUtdComposition />
    </Sequence>
    <Sequence from={1660} durationInFrames={290}>
      <OutroGraphic />
    </Sequence>
  </AbsoluteFill>
);

export const LeedsManUtdTikTokEntry: React.FC = () => (
  <Composition
    id="LeedsManUtdTikTok"
    component={LeedsManUtdTikTokComposition}
    durationInFrames={1950}
    fps={30}
    width={1080}
    height={1920}
  />
);
