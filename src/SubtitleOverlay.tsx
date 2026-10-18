import React from "react";
import { AbsoluteFill, Sequence } from "remotion";

const captions = [
  {
    "start": 0,
    "end": 5.8,
    "text": "ဒီတစ်ပတ် ပရီးမီးယားလိဂ်မှာ ပြိုင်ဘက်ဟောင်းနှစ်သင်းဖြစ်တဲ့"
  },
  {
    "start": 5.8,
    "end": 11.2,
    "text": "လိဒ်စ်ယူနိုက်တက်နဲ့ မန်ချက်စတာယူနိုက်တက်တို့ အဲလန်ရိုးဒ်ကွင်းမှာ အရေးကြီးတဲ့ သုံးမှတ်အတွက် ထိပ်တိုက်တွေ့ကြမှာပါ။"
  },
  {
    "start": 11.2,
    "end": 16.3,
    "text": "ပွဲကို မြန်မာစံတော်ချိန်အရ အောက်တိုဘာ ၁၈ ရက်၊ တနင်္ဂနွေနေ့ ည ၇ နာရီခွဲမှာ ကစားမှာ ဖြစ်ပါတယ်။"
  },
  {
    "start": 16.3,
    "end": 22,
    "text": "အိမ်ရှင်လိဒ်စ်အနေနဲ့ ပရိသတ်အားကို အားကိုးပြီး ပွဲအစကတည်းက ဖိအားပေးဖို့ လိုပါတယ်။"
  },
  {
    "start": 22,
    "end": 29,
    "text": "မန်ချက်စတာယူနိုက်တက်ကတော့ အဝေးကွင်းမှာလည်း တိုက်စစ်စွမ်းအားပြကာ ရလာတဲ့အခွင့်အရေးတွေကို"
  },
  {
    "start": 29,
    "end": 33.8,
    "text": "ဂိုးအဖြစ် ပြောင်းလဲနိုင်ဖို့ အရေးကြီးပါတယ်။ ဒီပွဲရဲ့ အဓိကတိုက်ပွဲက ကွင်းလယ်မှာ ဖြစ်လာနိုင်ပါတယ်။"
  },
  {
    "start": 33.8,
    "end": 39.2,
    "text": "ဘောလုံးပိုင်ဆိုင်မှု၊ ဖိအားပေးမှုနဲ့ တန်ပြန်တိုက်စစ်တွေက ရလဒ်ကို ဆုံးဖြတ်ပါလိမ့်မယ်။"
  },
  {
    "start": 39.2,
    "end": 44.2,
    "text": "လိဒ်စ်က အိမ်ကွင်းအရှိန်နဲ့ တက်လာနိုင်ပေမဲ့ ယူနိုက်တက်က နေရာလွတ်တွေကို အသုံးချပြီး"
  },
  {
    "start": 44.2,
    "end": 47.5,
    "text": "ထိုးဖောက်လာနိုင်ပါတယ်။ ကျွန်တော့်ရဲ့ ခန့်မှန်းချက်ကတော့—"
  },
  {
    "start": 47.5,
    "end": 50.3,
    "text": "လိဒ်စ်ယူနိုက်တက် ၁… မန်ချက်စတာယူနိုက်တက် ၂!"
  },
  {
    "start": 50.3,
    "end": 55.2,
    "text": "ယူနိုက်တက် အနိုင်ရနိုင်ခြေ ပိုများပေမဲ့ ဘောလုံးမှာ ဘာမဆို ဖြစ်နိုင်ပါတယ်။ ခင်ဗျားတို့ရဲ့ ခန့်မှန်းချက်ကရော ဘယ်လိုလဲဗျ? မှတ်ချက်မှာ ရေးခဲ့ကြပါဦး။"
  }
];

export const SubtitleOverlay: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none" }}>
    {captions.map((caption, index) => (
      <Sequence
        key={index}
        from={Math.round(caption.start * 30)}
        durationInFrames={Math.round((caption.end - caption.start) * 30)}
      >
        <div
          style={{
            position: "absolute",
            bottom: 190,
            left: 65,
            right: 65,
            padding: "16px 22px",
            backgroundColor: "rgba(0, 0, 0, 0.78)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#FFFFFF",
            fontFamily: "Arial, sans-serif",
            fontSize: 31,
            fontWeight: 700,
            lineHeight: 1.35,
            textAlign: "center",
            textShadow: "0 2px 5px rgba(0,0,0,0.9)",
          }}
        >
          {caption.text}
        </div>
      </Sequence>
    ))}
  </AbsoluteFill>
);
