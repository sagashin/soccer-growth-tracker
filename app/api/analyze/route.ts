import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  AIAnalysisResult,
  MatchType,
  generateFallbackAnalysis,
} from '@/lib/soccer-tracker';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      date,
      type = '公式戦',
      opponent = '対戦相手',
      minutesPlayed = 40,
      condition = 4,
      spikeName = '',
      goodPlays = '',
      challenges = '',
    } = body as {
      date?: string;
      type?: MatchType;
      opponent?: string;
      minutesPlayed?: number;
      condition?: number;
      spikeName?: string;
      goodPlays?: string;
      challenges?: string;
    };

    if (!goodPlays.trim() && !challenges.trim()) {
      return NextResponse.json(
        { error: '「良かったプレー」または「課題・悔しかったこと」を入力してください。' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      const fallback = generateFallbackAnalysis({
        type,
        opponent,
        minutesPlayed: Number(minutesPlayed) || 40,
        condition: Number(condition) || 4,
        goodPlays,
        challenges,
      });
      return NextResponse.json({ analysis: fallback, source: 'fallback' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `あなたはJFA公認ライセンスを持ち、ジュニアユース世代（U-13〜U-15）の育成に精通した経験豊富で論理的な専属サッカーコーチです。
以下のジュニアユース（U-15）サッカー選手の試合・練習の振り返りメモを分析し、構造化JSONデータを出力してください。

【試合・練習の基本情報】
- 日付: ${date || '未指定'}
- 種別: ${type}
- 対戦相手 / メニュー: ${opponent}
- 出場時間: ${minutesPlayed}分
- コンディション(5段階): ${condition} / 5
- 使用スパイク: ${spikeName || '指定なし'}

【選手の振り返りメモ】
- 良かったプレー・できたこと:
${goodPlays || '（特になし）'}

- 課題・悔しかったこと・うまくいかなかったこと:
${challenges || '（特になし）'}

【コーチングと分析の指針】
1. 抽象的な精神論（「もっと頑張ろう」「気合を入れよう」など）は一切排除してください。
2. 「いつ（どのタイミングで）・どこで（どのスペースや視野で）・どう動くか（身体の向き、ファーストタッチの置き所、2軸の重心移動、首振りのタイミングなど）」を踏まえた、ジュニアユース（中学生年代）の選手がピッチ上で映像としてイメージできる具体的なアドバイスにしてください。
3. scores（technical, tactical, physical, mental）はそれぞれ 1〜5 の整数で評価してください。
4. next_action には、次の練習や試合で意識する「たった1つの具体的なアクション目標」を簡潔かつ明確に記述してください。`;

    try {
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
      let response: any = null;
      let lastErr: unknown = null;

      for (const targetModel of candidateModels) {
        try {
          const geminiPromise = ai.models.generateContent({
            model: targetModel,
            contents: prompt,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary_title: {
                type: Type.STRING,
                description: '振り返りの一言タイトル（25〜40文字程度）',
              },
              four_pillars: {
                type: Type.OBJECT,
                properties: {
                  technical: {
                    type: Type.STRING,
                    description: '技術（トラップ、パス、シュート、1対1のボールタッチなど）の具体的な整理と分析',
                  },
                  tactical: {
                    type: Type.STRING,
                    description: '戦術（ポジショニング、視野・首振り、オフザボール、攻守の切り替えなど）の具体的な整理と分析',
                  },
                  physical: {
                    type: Type.STRING,
                    description: 'フィジカル（スプリント、ボディバランス、疲労度、2軸動作などの身体操作）の具体的な整理と分析',
                  },
                  mental: {
                    type: Type.STRING,
                    description: 'メンタル（集中力、声出し、ミス後の切り替え、チャレンジ精神など）の具体的な整理と分析',
                  },
                },
                required: ['technical', 'tactical', 'physical', 'mental'],
              },
              scores: {
                type: Type.OBJECT,
                properties: {
                  technical: {
                    type: Type.INTEGER,
                    description: '技術面の5段階評価（1〜5の整数）',
                  },
                  tactical: {
                    type: Type.INTEGER,
                    description: '戦術面の5段階評価（1〜5の整数）',
                  },
                  physical: {
                    type: Type.INTEGER,
                    description: 'フィジカル面の5段階評価（1〜5の整数）',
                  },
                  mental: {
                    type: Type.INTEGER,
                    description: 'メンタル面の5段階評価（1〜5の整数）',
                  },
                },
                required: ['technical', 'tactical', 'physical', 'mental'],
              },
              coaching_feedback: {
                type: Type.OBJECT,
                properties: {
                  praise: {
                    type: Type.STRING,
                    description: '良かった点への具体的かつ論理的な称賛（なぜ上手くいったのかのメカニズム解説）',
                  },
                  improvement: {
                    type: Type.STRING,
                    description: '課題への改善アプローチ（いつ・どこで・どう動くかの具体的な改善策）',
                  },
                  next_action: {
                    type: Type.STRING,
                    description: '次の練習や試合で意識する「たった1つの具体的なアクション目標」',
                  },
                },
                required: ['praise', 'improvement', 'next_action'],
              },
            },
            required: ['summary_title', 'four_pillars', 'scores', 'coaching_feedback'],
          },
        },
      });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
          );

          const res = await Promise.race([geminiPromise, timeoutPromise]);
          if (res.text?.trim()) {
            response = res;
            break;
          }
        } catch (mErr) {
          lastErr = mErr;
          console.warn(`Model ${targetModel} failed in /api/analyze, trying fallback:`, mErr);
        }
      }

      if (!response) {
        throw lastErr || new Error('All candidate Gemini models failed');
      }

      const rawText = response.text?.trim();

      const parsed = JSON.parse(rawText) as AIAnalysisResult;
      const clampScore = (n: number) => Math.max(1, Math.min(5, Math.round(Number(n) || 3)));
      parsed.scores = {
        technical: clampScore(parsed.scores?.technical),
        tactical: clampScore(parsed.scores?.tactical),
        physical: clampScore(parsed.scores?.physical),
        mental: clampScore(parsed.scores?.mental),
      };

      return NextResponse.json({ analysis: parsed, source: 'gemini' });
    } catch (apiError) {
      console.warn('Gemini API call fallback triggered:', apiError);
      const fallback = generateFallbackAnalysis({
        type,
        opponent,
        minutesPlayed: Number(minutesPlayed) || 40,
        condition: Number(condition) || 4,
        goodPlays,
        challenges,
      });
      return NextResponse.json({ analysis: fallback, source: 'fallback' });
    }
  } catch (err) {
    console.error('Analyze route error:', err);
    return NextResponse.json(
      { error: 'AI分析リクエストの処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
