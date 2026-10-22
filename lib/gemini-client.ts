import { AIAnalysisResult, MatchType, generateFallbackAnalysis } from './soccer-tracker';

export interface AnalysisInput {
  date?: string;
  type?: MatchType;
  opponent?: string;
  minutesPlayed?: number;
  condition?: number;
  spikeName?: string;
  goodPlays?: string;
  challenges?: string;
}

export interface AnalysisResponse {
  analysis: AIAnalysisResult;
  source: 'gemini' | 'smart_fallback';
  modelUsed?: string;
  errorMessage?: string;
}

const LOCAL_STORAGE_KEY = 'soccer_gemini_api_key';

// Candidate models in preference order (supports new, active, and legacy API keys)
export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
];

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
  }
}

/**
 * Tests connection to Gemini API with the given API key.
 */
export async function testGeminiApiKey(
  apiKey: string
): Promise<{ ok: boolean; model?: string; error?: string }> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { ok: false, error: 'APIキーが入力されていません。' };
  }

  let lastError = '';

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          trimmed
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: 'Respond with the word OK.' }],
              },
            ],
          }),
        }
      );

      if (res.ok) {
        return { ok: true, model };
      }

      const errText = await res.text();
      lastError = `Status ${res.status}: ${errText}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'ネットワークエラー';
    }
  }

  return { ok: false, error: lastError || 'APIキーが無効か、アクセス制限があります。' };
}

/**
 * Analyzes match reflection with Gemini, falling back across multiple flash models
 * and finally to the smart local engine if API is unavailable.
 */
export async function analyzeMatchReflection(
  input: AnalysisInput,
  apiKeyOverride?: string
): Promise<AnalysisResponse> {
  const apiKey = (apiKeyOverride ?? getStoredApiKey()).trim();

  // If no API key is set, use the smart local engine
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      analysis: generateFallbackAnalysis({
        type: input.type || '公式戦',
        opponent: input.opponent || '対戦相手',
        minutesPlayed: Number(input.minutesPlayed) || 40,
        condition: Number(input.condition) || 4,
        goodPlays: input.goodPlays || '',
        challenges: input.challenges || '',
      }),
      source: 'smart_fallback',
    };
  }

  const prompt = `あなたはJFA（日本サッカー協会）公認ライセンスを持ち、U-15・ジュニアユース世代（中学生年代）の育成に精通した経験豊富で論理的な専属サッカーコーチです。
ジュニアユース年代に必要な「攻守のトランジション（切り替えの早さ）」「位置的優位・数的優位の認知」「相手のプレッシャー強度への適応」「フィジカルコンタクトと2軸動作」を重視し、論理的かつ自立を促すアドバイスにしてください。
以下の選手の試合・練習メモを深く読み込み、その選手固有のプレー状況に即した具体的かつ論理的なフィードバックを構造化JSONで出力してください。

【試合・練習の基本情報】
- 日付: ${input.date || '未指定'}
- 種別: ${input.type || '公式戦'}
- 対戦相手 / メニュー: ${input.opponent || '対戦相手'}
- 出場時間: ${input.minutesPlayed ?? 40}分
- コンディション(5段階): ${input.condition ?? 4} / 5
- 使用スパイク: ${input.spikeName || '指定なし'}

【選手の振り返りメモ】
- 良かったプレー・できたこと:
${input.goodPlays || '（特になし）'}

- 課題・悔しかったこと・うまくいかなかったこと:
${input.challenges || '（特になし）'}

【コーチングと分析の重要指針】
1. 抽象的な精神論（「気合を入れよう」「もっと走ろう」等）は一切言わず、ピッチ上の映像が目に浮かぶような「いつ・どこで・どう動くか（身体の向き、ファーストタッチの置き所、相手DFの重心の見極め、首振りの回数とタイミングなど）」を具体的に記述してください。
2. 良かったプレーについては「なぜ上手くいったのか」のメカニズムを解説し、自信を深められるようにしてください。
3. 課題については具体的な改善ステップを提示してください。
4. 出力は必ず以下の形式の有効なJSONのみ（余計なMarkdownコードブロック \`\`\`json 等は含めないか、パース可能な形式）で返してください：

{
  "summary_title": "振り返りの一言タイトル（25〜40文字程度）",
  "four_pillars": {
    "technical": "技術面の整理と分析（良かった技術の再現性＋課題の技術修正の具体的ポイント）",
    "tactical": "戦術面の整理と分析（ポジショニング、視野・首振り、スペース活用、サポート角度など）",
    "physical": "フィジカル面の整理と分析（スプリント、ボディバランス、2軸動作、疲労時の身体の使い方など）",
    "mental": "メンタル面の整理と分析（集中力、ミス後の切り替え、積極性など）"
  },
  "scores": {
    "technical": 4,
    "tactical": 4,
    "physical": 3,
    "mental": 4
  },
  "coaching_feedback": {
    "praise": "良かった点への具体的かつ論理的な称賛（なぜ成功したのかのメカニズム解説）",
    "improvement": "課題への具体的改善アプローチ（いつ・どこで・どう動くかの改善策）",
    "next_action": "次の練習や試合で意識する『たった1つの具体的なアクション目標』"
  }
}`;

  let lastError = '';

  // Try candidate models in order of preference
  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Gemini model ${model} failed (${res.status}):`, errText);
        lastError = `HTTP ${res.status}`;
        continue; // Try next model
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = 'Empty response';
        continue;
      }

      // Clean markdown code blocks if any
      const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as AIAnalysisResult;

      // Clamp scores to 1-5 integer
      const clamp = (v: any) => Math.max(1, Math.min(5, Math.round(Number(v) || 3)));
      parsed.scores = {
        technical: clamp(parsed.scores?.technical),
        tactical: clamp(parsed.scores?.tactical),
        physical: clamp(parsed.scores?.physical),
        mental: clamp(parsed.scores?.mental),
      };

      return {
        analysis: parsed,
        source: 'gemini',
        modelUsed: model,
      };
    } catch (err) {
      console.warn(`Error with ${model}:`, err);
      lastError = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  // If all Gemini models failed, fall back to smart local engine
  console.warn('All Gemini candidate models failed, falling back to smart local engine. Error:', lastError);
  return {
    analysis: generateFallbackAnalysis({
      type: input.type || '公式戦',
      opponent: input.opponent || '対戦相手',
      minutesPlayed: Number(input.minutesPlayed) || 40,
      condition: Number(input.condition) || 4,
      goodPlays: input.goodPlays || '',
      challenges: input.challenges || '',
    }),
    source: 'smart_fallback',
    errorMessage: lastError,
  };
}
