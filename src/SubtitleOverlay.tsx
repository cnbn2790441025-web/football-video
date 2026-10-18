import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  interpolateColors,
  Easing,
} from "remotion";

const FPS = 30;

const captions = [
  { start: 0.080, end: 3.880, text: "ဒီတစ်ပတ် Premier League မှာ ပြိုင်ဘက်ဟောင်းနှစ်သင်းဖြစ်တဲ့ Leeds United နဲ့" },
  { start: 3.880, end: 7.860, text: "Manchester United တို့ Elland Road ကွင်းမှာ အရေးကြီးတဲ့ သုံးမှတ်အတွက် ထိပ်တိုက်" },
  { start: 7.860, end: 8.440, text: "တွေ့ကြမှာပါ။" },
  { start: 9.240, end: 14.140, text: "ပွဲကို မြန်မာစံတော်ချိန် အောက်တိုဘာ ၁၈ ရက် တနင်္ဂနွေနေ့ ဒီနေ့ည ခုနစ်နာရီခွဲမှာ ကစား" },
  { start: 14.140, end: 18.780, text: "မှာဖြစ်ပါတယ်။ Leeds အနေနဲ့ ပရိသတ်အားကို အားကိုးပြီး ပွဲအစကတည်းက ဖိအားပေး" },
  { start: 18.820, end: 19.400, text: "ဖို့လိုပါတယ်။" },
  { start: 20.020, end: 24.180, text: "Manchester United ကတော့ အဝေးကွင်းမှာလည်း တိုက်စစ်စွမ်းအားပြကာ ရလာတဲ့ အခွင့်အရေးတွေ" },
  { start: 24.200, end: 28.800, text: "ကို Goal အဖြစ်ပြောင်းလဲနိုင်ဖို့ အရေးကြီးပါတယ်။ ဒီပွဲရဲ့ အဓိကတိုက်ပွဲက ကွင်းလယ်မှာ" },
  { start: 28.800, end: 29.480, text: "ဖြစ်လာနိုင်ပါတယ်။" },
  { start: 30.120, end: 34.280, text: "ဘောလုံးပိုင်ဆိုင်မှု၊ ဖိအားပေးမှုနဲ့ တန်ပြန်တိုက်စစ်တွေက ရလဒ်ကို ဆုံးဖြတ်ပါလိမ့်မယ်။" },
  { start: 34.280, end: 38.980, text: "Leeds က အိမ်ကွင်းအရှိန်နဲ့ တက်လာနိုင်ပေမယ့် United က နေရာလွတ်တွေကို အသုံးချပြီး" },
  { start: 38.980, end: 43.300, text: "ထိုးဖောက်လာနိုင်ပါတယ်။ ကျွန်တော့်ရဲ့ ခန့်မှန်းချက်ကတော့ Leeds United တစ်ဂိုး" },
  { start: 43.300, end: 47.460, text: "Manchester United နှစ်ဂိုး ဖြစ်ပါတယ်။ United နိုင်ရနိုင်ခြေ ပိုများပေမယ့် ဘော" },
  { start: 47.460, end: 51.660, text: "လုံးမှာ ဘာမဆို ဖြစ်နိုင်ပါတယ်။ ခန့်မှန်းချက်မှန်မမှန် Elland Road ကွင်းမှာပဲ သိရပါမယ်။" },
  { start: 51.660, end: 55.140, text: "ခင်ဗျားတို့ရဲ့ ခန့်မှန်းချက်ကရော ဘယ်လိုလဲဗျာ။ မှတ်ချက်မှာ ရေးခဲ့ကြပါဦး။" },
];

const SubtitleStyle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 7, 15, 24],
    [0, 1, 1, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  const scale = interpolate(
    frame,
    [0, 12],
    [0.96, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const glow = 0.35 + Math.sin(frame / 12) * 0.12;

  const accent = interpolate(
    Math.sin(frame / 18),
    [-1, 1],
    [0, 1],
  );

  const borderColor = `rgba(255, ${Math.round(190 + accent * 65)}, ${Math.round(30 + accent * 30)}, 0.8)`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 300,
        left: 65,
        right: 65,
        padding: "16px 22px",
        backgroundColor: "rgba(5, 8, 18, 0.86)",
        borderRadius: 14,
        border: `2px solid ${borderColor}`,
        color: interpolateColors(frame % 120, [0, 40, 80, 120], ["#FFFFFF", "#FFD84D", "#55C8FF", "#FFFFFF"]),
        fontFamily: "Noto Sans Myanmar",
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.5,
        textAlign: "center",
        opacity,
        transform: `scale(${scale})`,
        textShadow: `
          0 2px 3px rgba(0,0,0,0.95),
          0 0 10px rgba(255,190,30,${glow})
        `,
        boxShadow: `0 0 18px rgba(255,190,30,${glow * 0.35})`,
      }}
    >
      {text}
    </div>
  );
};

export const SubtitleOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @font-face {
          font-family: "Noto Sans Myanmar";
          src: url("${staticFile("fonts/NotoSansMyanmar-Regular.woff2")}") format("woff2");
          font-style: normal;
          font-weight: 400;
          font-display: block;
        }

        @font-face {
          font-family: "Noto Sans Myanmar";
          src: url("${staticFile("fonts/NotoSansMyanmar-Bold.woff2")}") format("woff2");
          font-style: normal;
          font-weight: 700;
          font-display: block;
        }
      `}</style>

      {captions.map((caption, index) => {
        const from = Math.round(caption.start * FPS);
        const end = Math.round(caption.end * FPS);

        return (
          <Sequence
            key={index}
            from={from}
            durationInFrames={end - from}
          >
            <SubtitleStyle text={caption.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
