import React from "react";
import { AbsoluteFill, Sequence } from "remotion";

const FPS = 30;

const captions = [
  {
    start: 0.080,
    end: 3.880,
    text: "ဒီတစ်ပတ် Premier League မှာ ပြိုင်ဘက်ဟောင်းနှစ်သင်းဖြစ်တဲ့ Leeds United နဲ့",
  },
  {
    start: 3.880,
    end: 7.860,
    text: "Manchester United တို့ Elland Road ကွင်းမှာ အရေးကြီးတဲ့ သုံးမှတ်အတွက် ထိပ်တိုက်",
  },
  {
    start: 7.860,
    end: 8.440,
    text: "တွေ့ကြမှာပါ။",
  },
  {
    start: 9.240,
    end: 14.140,
    text: "ပွဲကို မြန်မာစံတော်ချိန် အောက်တိုဘာ ၁၈ ရက် တနင်္ဂနွေနေ့ ဒီနေ့ည ခုနစ်နာရီခွဲမှာ ကစား",
  },
  {
    start: 14.140,
    end: 18.780,
    text: "မှာဖြစ်ပါတယ်။ Leeds အနေနဲ့ ပရိသတ်အားကို အားကိုးပြီး ပွဲအစကတည်းက ဖိအားပေး",
  },
  {
    start: 18.820,
    end: 19.400,
    text: "ဖို့လိုပါတယ်။",
  },
  {
    start: 20.020,
    end: 24.180,
    text: "Manchester United ကတော့ အဝေးကွင်းမှာလည်း တိုက်စစ်စွမ်းအားပြကာ ရလာတဲ့ အခွင့်အရေးတွေ",
  },
  {
    start: 24.200,
    end: 28.800,
    text: "ကို Goal အဖြစ်ပြောင်းလဲနိုင်ဖို့ အရေးကြီးပါတယ်။ ဒီပွဲရဲ့ အဓိကတိုက်ပွဲက ကွင်းလယ်မှာ",
  },
  {
    start: 28.800,
    end: 29.480,
    text: "ဖြစ်လာနိုင်ပါတယ်။",
  },
  {
    start: 30.120,
    end: 34.280,
    text: "ဘောလုံးပိုင်ဆိုင်မှု၊ ဖိအားပေးမှုနဲ့ တန်ပြန်တိုက်စစ်တွေက ရလဒ်ကို ဆုံးဖြတ်ပါလိမ့်မယ်။",
  },
  {
    start: 34.280,
    end: 38.980,
    text: "Leeds က အိမ်ကွင်းအရှိန်နဲ့ တက်လာနိုင်ပေမယ့် United က နေရာလွတ်တွေကို အသုံးချပြီး",
  },
  {
    start: 38.980,
    end: 43.300,
    text: "ထိုးဖောက်လာနိုင်ပါတယ်။ ကျွန်တော့်ရဲ့ ခန့်မှန်းချက်ကတော့ Leeds United တစ်ဂိုး",
  },
  {
    start: 43.300,
    end: 47.460,
    text: "Manchester United နှစ်ဂိုး ဖြစ်ပါတယ်။ United နိုင်ရနိုင်ခြေ ပိုများပေမယ့် ဘော",
  },
  {
    start: 47.460,
    end: 51.660,
    text: "လုံးမှာ ဘာမဆို ဖြစ်နိုင်ပါတယ်။ ခန့်မှန်းချက်မှန်မမှန် Elland Road ကွင်းမှာပဲ သိရပါမယ်။",
  },
  {
    start: 51.660,
    end: 55.140,
    text: "ခင်ဗျားတို့ရဲ့ ခန့်မှန်းချက်ကရော ဘယ်လိုလဲဗျာ။ မှတ်ချက်မှာ ရေးခဲ့ကြပါဦး။",
  },
];

export const SubtitleOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {captions.map((caption, index) => {
        const from = Math.round(caption.start * FPS);
        const end = Math.round(caption.end * FPS);

        return (
          <Sequence
            key={index}
            from={from}
            durationInFrames={end - from}
          >
            <div
              style={{
                position: "absolute",
                bottom: 340,
                left: 65,
                right: 65,
                padding: "16px 22px",
                backgroundColor: "rgba(0, 0, 0, 0.78)",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#FFFFFF",
                fontFamily: "Arial, sans-serif",
                fontSize: 38,
                fontWeight: 700,
                lineHeight: 1.35,
                textAlign: "center",
                textShadow: "0 2px 5px rgba(0,0,0,0.9)",
              }}
            >
              {caption.text}
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
