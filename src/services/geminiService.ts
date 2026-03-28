import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MediaType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    type: { type: Type.STRING },
    overallRisk: { type: Type.NUMBER },
    categories: {
      type: Type.OBJECT,
      properties: {
        bullying: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["score", "label", "reason"]
        },
        violence: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["score", "label", "reason"]
        },
        psychological: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["score", "label", "reason"]
        },
        cultural: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["score", "label", "reason"]
        },
        insult: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["score", "label", "reason"]
        }
      },
      required: ["bullying", "violence", "psychological", "cultural", "insult"]
    },
    detailedExplanation: { type: Type.STRING },
    ageRecommendation: { type: Type.STRING },
    riskyPhrases: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["title", "type", "overallRisk", "categories", "detailedExplanation", "ageRecommendation", "riskyPhrases"]
};

export async function analyzeMedia(name: string, type: MediaType): Promise<AnalysisResult> {
  // AI Studio'da anahtar genellikle process.env.GEMINI_API_KEY veya VITE_GEMINI_API_KEY olarak gelir
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '') {
    throw new Error("Sistem Hazırlanıyor: Bu uygulama tamamen ücretsizdir. Analizlerin başlayabilmesi için lütfen AI Studio panelinden API anahtarınızı (Secrets) tanımlayın.");
  }

  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Sen Türkçe dil ve Türkiye kültürü konusunda uzman bir içerik analiz yapay zekasısın.
Görevin: Verilen medya içeriğinde (kitap, şarkı, film, dizi) zorbalık, şiddet ve psikolojik baskı unsurlarını tespit etmek.

Analiz Kuralları:
1. Her kategori için risk skorunu mutlaka 0 ile 100 arasında bir tam sayı olarak belirle (0: Risk yok, 100: Maksimum risk).
2. Türk kültüründe taşıdığı örtük ve dolaylı anlamları dikkate al (Örn: "Adam yerine koymamak", "Ezmek", "Sen kimsin ya?").
3. Açık küfürden çok, ima ve kültürel baskılara odaklan ("Adam gibi", "El alem ne der" gibi ifadeleri kültürel zorbalık olarak değerlendir).
4. Mizah veya eleştiri ile normalleştirme arasındaki farkı ayırt et. Eleştirel anlatımlarda risk skorunu düşür.
5. Çocuk ve ergenler üzerindeki olası etkileri özellikle belirt.
6. Yanıtını mutlaka belirtilen JSON formatında ver.`;

  const prompt = `Lütfen şu ${type} içeriğini analiz et: "${name}". 
Önce bu içerik hakkında (konusu, sözleri, temaları) araştırma yap, ardından zorbalık ve şiddet analizi gerçekleştir. 
Özellikle Türk kültürü bağlamındaki riskli ifadeleri ve temaları yakala.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any
    }
  });

  try {
    const result = JSON.parse(response.text);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Analysis parsing error:", error);
    throw new Error("Analiz sonuçları işlenirken bir hata oluştu.");
  }
}
