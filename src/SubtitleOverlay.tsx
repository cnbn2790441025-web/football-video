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
  { start: 0.100, end: 3.680, text: "မင်္ဂလာပါ ဘောလုံးချစ်သူတို့ရေ Premier League ရဲ့ စိတ်ဝင်စားစရာ ပွဲစဉ်တစ်ပွဲ လာပါ" },
  { start: 3.680, end: 8.160, text: "ပြီ။ Anfield မှာ Liverpool နဲ့ Brighton ထိ ပ်တိုက်တွေ့တော့မှာပါ။ အောက်တိုဘာ ၂၅ ရက် တန" },
  { start: 8.160, end: 12.400, text: "င်္ဂနွေနေ့ မြန်မာစံတော်ချိန် ည ၈ နာရီခွဲ မှာ စတင်ကစားမှာ ဖြစ်ပါတယ်။ Liverpool က နော" },
  { start: 12.400, end: 15.920, text: "က်ဆုံးငါးပွဲမှာ လေးပွဲနိုင်ထားပြီး ဆယ့်နှ စ်ဂိုးသွင်းနိုင်ခဲ့ပေမယ့် မန်စီးတီးကို" },
  { start: 15.920, end: 19.860, text: "သုံးဂိုးပျက်ရှုံးခဲ့တာကိုလည်း မေ့ထားလို့မရ ပါဘူး။ Brighton ကတော့ နောက်ဆုံးငါးပွဲလုံး" },
  { start: 19.860, end: 23.980, text: "အနိုင်ရထားပြီး ဆယ့်ခုနစ်ဂိုးသွင်း နှစ်ဂိုး သာ ပေးထားရတာမို့ လက်ရှိရလဒ်ပိုင်းမှာတော့ တ" },
  { start: 23.980, end: 27.840, text: "ကယ်ကို အားကောင်းနေပါတယ်။ ဒါပေမယ့် Anfield မှာ ကစားရမယ့် Liverpool ကို လျှော့တွက်လို့" },
  { start: 27.840, end: 31.520, text: "မရပါဘူး။ Brighton ရဲ့ လက်ရှိဂိုးသွင်းအား နဲ့ Liverpool ရဲ့ အိမ်ကွင်းအားသာချက် ဘယ်သူ" },
  { start: 31.560, end: 35.360, text: "ပိုထိရောက်မလဲဆိုတာ သိပ်မကြာခင် Anfield မှာ သိရတော့မှာပါ။ ကျွန်တော်တစ်ယောက်တည်းအမြင်အ" },
  { start: 35.360, end: 38.840, text: "ရ Liverpool ဘက်ကို အနည်းငယ် ပိုမျှော်လင့် ထားပါတယ်။ ဒါပေမယ့် Brighton ရဲ့ ကောင်းမွန်" },
  { start: 38.840, end: 42.140, text: "တဲ့ လက်ရှိပုံစံကြောင့် လွယ်ကူမယ့်ပွဲတော့ မ ဟုတ်ပါဘူး။ Liverpool တော့ အိမ်ကွင်းအားနဲ့" },
  { start: 42.140, end: 45.400, text: "သေချာဂရုစိုက်ပြီး ကစားရပါမယ်။ ကျွန်တော့် ရဲ့ ခန့်မှန်းချက်က Liverpool နှစ်ဂိုး" },
  { start: 45.400, end: 48.960, text: "Brighton တစ်ဂိုး ဖြစ်ပါတယ်။ နောက်ဆုံးမှာ ဘ ယ်အသင်းက အနိုင်ရပြီး သုံးမှတ်ရရှိသွားမလဲ" },
  { start: 48.980, end: 52.900, text: "ဆိုတာကတော့ ပွဲပြီးမှပဲ သိရမှာပါဗျ။ ခင်ဗျား တို့ရဲ့ ခန့်မှန်းချက်ကရော မှတ်ချက်လေးတွေ" },
  { start: 52.900, end: 53.660, text: "ရေးခဲ့ကြပါဦးဗျာ။" }
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
        color: interpolateColors(frame % 240, [0, 80, 160, 240], ["#FFFFFF", "#FFD84D", "#55C8FF", "#FFFFFF"]),
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
