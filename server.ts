import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildFallbackAds(desc: string, goal: string) {
  const snippet = desc.length > 65 ? desc.slice(0, 65) + '…' : desc;
  const ctaMap: Record<string, string> = {
    'رسائل واتساب': 'راسلنا واتساب',
    'زيارة الموقع': 'اطلب الآن',
    'مبيعات مباشرة': 'اشترِ الآن',
  };
  const cta = ctaMap[goal] || 'تواصل معنا';

  return [
    {
      h: 'جرّبه اليوم وستعود إليه دائماً',
      t: `${snippet}\nجودة تلمسها من أول تجربة وخدمة سريعة تحترم وقتك في كل طلب.`,
      c: cta,
      v: 'صورة قريبة احترافية للمنتج بإضاءة دافئة ولمسات ذهبية فاخرة',
      angle: 'التركيز على الجودة والثقة',
    },
    {
      h: 'عرض خاص لفترة محدودة جداً',
      t: `${snippet}\nاحجز طلبك الآن واستفد من العرض الحصري قبل انتهاء الكمية المتاحة هذا الأسبوع.`,
      c: cta,
      v: 'تصميم إعلاني بشارة خصم ذهبية واضحة على خلفية زمردية داكنة',
      angle: 'عرض ترويجي عاجل',
    },
    {
      h: 'الخيار الأول الذي يثق به أهل مدينتك',
      t: `${snippet}\nانضم لمئات الزبائن الراضين يومياً واطلب مباشرة بخطوة واحدة.`,
      c: cta,
      v: 'تصميم يبرز تقييمات الزبائن الخمس نجوم مع صورة المنتج الحقيقية',
      angle: 'الإثبات الاجتماعي والسمعة',
    },
  ];
}

app.post('/api/generate-ads', async (req, res) => {
  const { description, goal, provinces } = req.body || {};
  const cleanDesc = String(description || '').trim();
  const cleanGoal = String(goal || 'رسائل واتساب').trim();
  const regionText = Array.isArray(provinces) && provinces.length > 0 ? provinces.join('، ') : 'سوريا';

  if (!cleanDesc) {
    return res.status(400).json({ error: 'يرجى إدخال وصف المنتج أو الخدمة أولاً' });
  }

  const ai = getGenAIClient();
  if (!ai) {
    return res.json({ variations: buildFallbackAds(cleanDesc, cleanGoal), source: 'fallback' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `أنت خبير كتابة إعلانات ميتا (فيسبوك وإنستغرام) في السوق السوري والعربي.
اكتب 3 نماذج إعلانية احترافية ومقنعة جداً لمنتج أو خدمة بالمعلومات التالية:
- الوصف: ${cleanDesc}
- الهدف الإعلاني: ${cleanGoal}
- المناطق المستهدفة: ${regionText}

اجعل اللهجة عربية سورية بيضاء راقية وجذابة ومباشرة تحفز على النقر والشراء.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              h: {
                type: Type.STRING,
                description: 'عنوان الإعلان الجذاب والقصير (بدون إيموجي مبالغ به)',
              },
              t: {
                type: Type.STRING,
                description: 'النص الإعلاني الأساسي من سطرين إلى ثلاثة أسطر مقنعة',
              },
              c: {
                type: Type.STRING,
                description: 'نص زر الإجراء مثل: راسلنا واتساب أو اطلب الآن أو اشترِ الآن',
              },
              v: {
                type: Type.STRING,
                description: 'وصف فكرة التصميم أو الصورة المقترحة للإعلان',
              },
              angle: {
                type: Type.STRING,
                description: 'زاوية التسويق (مثال: عرض حصري، جودة مضمونة، ثقة الزبائن)',
              },
            },
            required: ['h', 't', 'c', 'v', 'angle'],
          },
        },
      },
    });

    const rawText = response.text?.trim();
    if (rawText) {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ variations: parsed.slice(0, 3), source: 'gemini' });
      }
    }
    return res.json({ variations: buildFallbackAds(cleanDesc, cleanGoal), source: 'fallback' });
  } catch (err) {
    console.error('Gemini ad generation error, falling back:', err);
    return res.json({ variations: buildFallbackAds(cleanDesc, cleanGoal), source: 'fallback' });
  }
});

app.post('/api/support-reply', async (req, res) => {
  const { message, activeCampaignsCount, walletBalance } = req.body || {};
  const userMsg = String(message || '').trim();
  if (!userMsg) {
    return res.status(400).json({ error: 'الرسالة فارغة' });
  }

  const ai = getGenAIClient();
  if (!ai) {
    return res.json({
      reply:
        'استلمنا رسالتك في قسم إدارة الحملات لدى «يلا إعلان». يراجع مختص الإعلانات طلبك الآن لضمان أعلى عائد ومبيعات لحملتك عبر بطاقات التمويل الدولية.',
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `أنت مختص إدارة حملات إعلانية في منصة "يلا إعلان" (Yalla Ads) في سوريا.
شعار المنصة: "شغّل إعلانك بإيدك، وفريق كامل بيدير الحملة معك".
المستخدم يدفع محلياً عبر "شام كاش" بالليرة السورية أو يخصم من محفظته بالدولار، والمنصة تمول إعلانات ميتا (فيسبوك وإنستغرام) عبر بطاقات بوتيم الدولية مع عمولة إدارة وتحسين 20%.
رصيد محفظة المستخدم الحالي: $${walletBalance ?? 0}، وعدد حملاته النشطة: ${activeCampaignsCount ?? 1}.
رد على رسالة المستخدم التالية باحترافية وإيجاز وود باللغة العربية (سطرين كحد أقصى):
"${userMsg}"`,
    });

    const reply =
      response.text?.trim() ||
      'استلمنا رسالتك، يراجع مختص الحملات في فريق يلا إعلان استفسارك وسنتابع تحسين أداء حملتك خطوة بخطوة.';
    return res.json({ reply });
  } catch (err) {
    console.error('Gemini support chat error:', err);
    return res.json({
      reply:
        'استلمنا رسالتك، وسيراجعها أحد مختصي الحملات في فريق يلا إعلان ويرد عليك بالتفاصيل فوراً.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yalla Ads server running on http://localhost:${PORT}`);
  });
}

startServer();
