import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  staticFile,
  useCurrentFrame,
} from "remotion";
import preview from "./preview-full.json";

const FPS = preview.fps;

type Word = {
  text: string;
  start: number;
  end: number;
};

type Caption = {
  id: number;
  start: number;
  end: number;
  text: string;
  words: Word[];
};

const captions = preview.captions as Caption[];

const PreviewVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / FPS;

  const activeCaption =
    captions.find((caption) =>
      time >= caption.start && time < caption.end
    ) ?? captions[captions.length - 1];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #101018, #20283a 55%, #080808)",
        color: "white",
        fontFamily: "Noto Sans Myanmar",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <style>{`
        @font-face {
          font-family: "Noto Sans Myanmar";
          src: url("${staticFile("fonts/NotoSansMyanmar-Regular.woff2")}") format("woff2");
          font-weight: 400;
        }
        @font-face {
          font-family: "Noto Sans Myanmar";
          src: url("${staticFile("fonts/NotoSansMyanmar-Bold.woff2")}") format("woff2");
          font-weight: 700;
        }
      `}</style>

      <Audio src={staticFile(preview.audio)} />

      <div
        style={{
          position: "absolute",
          top: 100,
          width: "100%",
          textAlign: "center",
          fontSize: 30,
          fontWeight: 700,
          color: "#ffcc55",
        }}
      >
        MYANMAR CTC FULL-LENGTH TEST
      </div>

      <div
        style={{
          position: "absolute",
          top: 350,
          width: "100%",
          textAlign: "center",
          fontSize: 25,
          color: "#cccccc",
        }}
      >
        CAPTION {activeCaption.id} / {captions.length}
      </div>

      <div
        style={{
          position: "absolute",
          left: 65,
          right: 65,
          top: 500,
          padding: "28px 26px",
          backgroundColor: "rgba(5, 8, 18, 0.9)",
          borderRadius: 18,
          border: "2px solid rgba(255, 190, 30, 0.75)",
          textAlign: "center",
          fontSize: 46,
          fontWeight: 700,
          lineHeight: 1.9,
        }}
      >
        {activeCaption.words.map((word, index) => {
          const active = time >= word.start && time < word.end;

          return (
            <React.Fragment key={`${activeCaption.id}-${index}`}>
              <span
                style={{
                  color: active ? "#111111" : "#FFFFFF",
                  backgroundColor: active ? "#FFD84D" : "transparent",
                  borderRadius: 7,
                  padding: active ? "2px 5px" : "0",
                  textShadow: active ? "none" : "0 2px 4px #000000",
                }}
              >
                {word.text}
              </span>
              {index < activeCaption.words.length - 1 ? " " : ""}
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 110,
          width: "100%",
          textAlign: "center",
          fontSize: 25,
          color: "#cccccc",
        }}
      >
        FULL-LENGTH ISOLATED EXPERIMENT
      </div>
    </AbsoluteFill>
  );
};

export const MyanmarCtcFullPreview: React.FC = () => (
  <Composition
    id="MyanmarCtcFullPreview"
    component={PreviewVideo}
    durationInFrames={Math.ceil(preview.durationSeconds * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
