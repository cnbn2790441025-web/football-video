import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import matchData from "./matchData.json";
import { LeedsManUtdComposition } from "./LeedsManUtdComposition";

const gold = "#F7D46A";

type PlayerSide = "home" | "away";

const PlayerSpotlight: React.FC<{ side: PlayerSide }> = ({ side }) => {
  const frame = useCurrentFrame();

  const isHome = side === "home";
  const team = isHome ? matchData.homeTeam : matchData.awayTeam;
  const short = isHome ? matchData.homeShort : matchData.awayShort;
  const name = isHome ? matchData.homePlayerName : matchData.awayPlayerName;
  const role = isHome ? matchData.homePlayerRole : matchData.awayPlayerRole;
  const trait = isHome ? matchData.homePlayerTrait : matchData.awayPlayerTrait;
  const player = isHome ? matchData.homePlayer : matchData.awayPlayer;
  const logo = isHome ? matchData.homeLogo : matchData.awayLogo;

  const opacity = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rise = interpolate(frame, [0, 25], [45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const imageScale = interpolate(frame, [0, 150], [0.94, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #19354a 0%, #08131f 55%, #020609 100%)",
        color: "white",
        fontFamily: "Arial, Helvetica, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "7% 6%",
          border: "2px solid rgba(255,255,255,0.22)",
          borderRadius: 24,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 125,
          left: 65,
          right: 65,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {logo ? (
          <Img
            src={staticFile(logo)}
            style={{ width: 82, height: 82, objectFit: "contain" }}
          />
        ) : null}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: gold,
              fontSize: 23,
              fontWeight: 900,
              letterSpacing: 4,
            }}
          >
            KEY PLAYER
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>
            {short}
          </div>
        </div>
      </div>

      {player ? (
        <Img
          src={staticFile(player)}
          style={{
            position: "absolute",
            bottom: 0,
            width: 650,
            height: 1120,
            objectFit: "contain",
            objectPosition: "bottom center",
            transform: `translateY(${rise}px) scale(${imageScale})`,
            filter: "drop-shadow(0 0 32px rgba(0,0,0,0.55))",
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          bottom: 125,
          padding: "30px 28px",
          textAlign: "center",
          borderRadius: 22,
          border: "2px solid rgba(247,212,106,0.7)",
          background: "rgba(2,8,15,0.88)",
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.1,
            color: gold,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 23,
            fontWeight: 800,
            letterSpacing: 2,
            marginTop: 14,
          }}
        >
          {role}
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#D9E2EC",
            marginTop: 12,
          }}
        >
          {trait}
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#FFFFFF",
            marginTop: 16,
          }}
        >
          {team}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LeedsManUtdTikTokComposition: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#020609" }}>
    <Sequence durationInFrames={1650}>
      <LeedsManUtdComposition />
    </Sequence>

    <Sequence from={1650} durationInFrames={300}>
      <Sequence durationInFrames={150}>
        <PlayerSpotlight side="home" />
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <PlayerSpotlight side="away" />
      </Sequence>
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
