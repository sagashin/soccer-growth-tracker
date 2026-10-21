export type MatchType = '公式戦' | '練習試合' | '練習';

export type TimestampTag = 'Good' | '課題' | '戦術' | 'フィジカル';

export interface VideoTimestamp {
  id: string;
  timeStr: string; // e.g., "12:34"
  seconds: number;
  tag: TimestampTag;
  memo: string;
}

export interface FourPillars {
  technical: string;
  tactical: string;
  physical: string;
  mental: string;
}

export interface FourPillarScores {
  technical: number; // 1-5 integer
  tactical: number;  // 1-5 integer
  physical: number;  // 1-5 integer
  mental: number;    // 1-5 integer
}

export interface CoachingFeedback {
  praise: string;
  improvement: string;
  next_action: string;
}

export interface AIAnalysisResult {
  summary_title: string;
  four_pillars: FourPillars;
  scores: FourPillarScores;
  coaching_feedback: CoachingFeedback;
}

export interface MatchRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: MatchType;
  opponent: string;
  minutesPlayed: number;
  condition: number; // 1-5
  spikeId: string;
  goodPlays: string;
  challenges: string;
  aiAnalysis: AIAnalysisResult;
  youtubeUrl: string;
  timestamps: VideoTimestamp[];
  createdAt: string;
}

export interface SpikeGear {
  id: string;
  brand: string;
  modelName: string;
  sizeCm: string;
  featureMemo: string;
  startDate: string; // YYYY-MM-DD
}

export interface SpikeUsageStats {
  spikeId: string;
  usageCount: number;
  totalMinutes: number;
  lastUsedDate: string | null;
  statusLevel: 'optimal' | 'maintenance' | 'replace';
  statusLabel: string;
  wearPercentage: number;
}

export interface DashboardSummary {
  totalMatches: number;
  totalMinutes: number;
  averageCondition: number;
  averageScores: FourPillarScores;
  overallAverageScore: number;
  officialMatchCount: number;
  practiceMatchCount: number;
  trainingCount: number;
}

export const INITIAL_SPIKES: SpikeGear[] = [
  {
    id: 'spike-mizuno-morelia-2',
    brand: 'MIZUNO (ミズノ)',
    modelName: 'モレリア II JAPAN',
    sizeCm: '23.5',
    featureMemo: 'カンガルーレザーで足馴染み抜群。天然芝・人工芝の公式戦メイン用。トラップ時のボールタッチ感覚が繊細に伝わる。',
    startDate: '2026-04-10',
  },
  {
    id: 'spike-asics-dslight-xfly',
    brand: 'ASICS (アシックス)',
    modelName: 'DS LIGHT X-FLY PRO 2',
    sizeCm: '23.5',
    featureMemo: 'つま先のグリップ力が高く、初速の5mスプリントと切り返しが鋭く決まる。土・人工芝の練習試合＆ハードな練習用。',
    startDate: '2026-06-01',
  },
];

export const INITIAL_RECORDS: MatchRecord[] = [
  {
    id: 'rec-2026-10-18',
    date: '2026-10-18',
    type: '公式戦',
    opponent: 'FCバロンドールU-12（後期リーグ第4節）',
    minutesPlayed: 40,
    condition: 5,
    spikeId: 'spike-mizuno-morelia-2',
    goodPlays:
      '前半12分、ボランチからパスを受ける前に2回首を振って相手CBの位置を確認し、左足インサイドのファーストタッチで前を向いてスルーパスを通せた。後半も切り替えのプレスバックで2回ボールを奪い返した。',
    challenges:
      '後半15分、ペナルティエリア手前でフリーになった場面で、焦ってしまいシュートが浮いて枠外になった。また試合終盤に相手のフィジカルが強い選手との1対1で体が流れてしまった。',
    aiAnalysis: {
      summary_title: '事前スキャンからの前向きファーストタッチが光った公式戦',
      four_pillars: {
        technical:
          '受ける前の認知と連動した左足インサイドの方向づけトラップ、および味方の走るスペースへ通したスルーパスの精度が非常に高い水準でした。一方、バイタルエリアでのシュート時に軸足が後ろに残る課題が見られました。',
        tactical:
          'ボールが移動中に2回首を振って相手CBの立ち位置を把握できており、攻守の切り替え（トランジション）でのプレスバックもチームを助ける効果的な判断でした。',
        physical:
          '40分間を通して運動量を維持できましたが、後半終盤のコンタクト局面で骨盤が後傾し、片軸に体重が乗って流れてしまう場面がありました。',
        mental:
          '公式戦の緊張感の中でも積極的に前を向くチャレンジを続け、ボールロスト後の即時奪回に向かう強い集中力を発揮できています。',
      },
      scores: {
        technical: 4,
        tactical: 5,
        physical: 3,
        mental: 5,
      },
      coaching_feedback: {
        praise:
          '前半12分のシーン、パスが出る前に2回首を振って「相手CBの背後が空いている」と認知できていたからこそ、ファーストタッチで迷わず前を向けました。技術と戦術眼が見事に噛み合った素晴らしいプレーです。',
        improvement:
          'シュートが浮いた原因は「焦り」そのものより、ボールの横に踏み込む軸足がボールより後ろ（かかと寄り）につき、上体がのけぞったことにあります。また終盤の1対1は、相手とぶつかる瞬間に両足の母指球で地面を捉える2軸の姿勢を作ると当たり負けしません。',
        next_action:
          'シュート練習の最初の5本で「軸足をボールの真横に置き、おへそをターゲットに向けてインパクトする」ことだけを意識して打つ。',
      },
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    timestamps: [
      {
        id: 'ts-1',
        timeStr: '04:15',
        seconds: 255,
        tag: 'Good',
        memo: '受ける前の2回首振り→左足ターンから裏へのスルーパス成功',
      },
      {
        id: 'ts-2',
        timeStr: '11:40',
        seconds: 700,
        tag: '戦術',
        memo: '攻守切り替え3秒以内のプレスバックでインターセプト',
      },
      {
        id: 'ts-3',
        timeStr: '18:22',
        seconds: 1102,
        tag: '課題',
        memo: 'PA手前のフリーシュートが浮いた場面（軸足の位置を確認）',
      },
    ],
    createdAt: '2026-10-18T18:30:00.000Z',
  },
  {
    id: 'rec-2026-10-11',
    date: '2026-10-11',
    type: '練習試合',
    opponent: '青葉台ジュニアSC（15分×3本）',
    minutesPlayed: 45,
    condition: 4,
    spikeId: 'spike-asics-dslight-xfly',
    goodPlays:
      'サイドハーフで出場し、味方SBがボールを持った瞬間に相手SBの背後（ブラインドサイド）へ斜めに走り出して3回チャンスを作れた。ドリブルの緩急で縦に突破してクロスを2本上げられた。',
    challenges:
      'クロスを上げる直前に中を見る余裕がなく、ファーサイドでフリーだった味方に気づかずニアのDFに引っかかってしまった。守備時に自分のマークとボールを同一視野に入れるポジション取りが遅れた。',
    aiAnalysis: {
      summary_title: 'オフザボールの斜めのランニングで相手守備網を崩したTRM',
      four_pillars: {
        technical:
          '緩急を使った縦突破のドリブルは切れ味がありましたが、クロスを上げる1歩前のタッチが少し足元に入りすぎ、顔を上げる余裕を奪っていました。',
        tactical:
          '味方SBが顔を上げた瞬間に相手DFの死角から斜めに飛び出すオフザボールの動き出しは抜群でした。守備時はボールウォッチャーにならず半身の姿勢を作る意識が必要です。',
        physical:
          '45分間で何度もスプリントを繰り返す走力と、初速の鋭さが際立っていました。',
        mental:
          '何度も裏を狙い続ける積極性があり、パスが出なくても腐らずに動き直せていた点が高く評価できます。',
      },
      scores: {
        technical: 3,
        tactical: 4,
        physical: 4,
        mental: 4,
      },
      coaching_feedback: {
        praise:
          '味方SBがボールを持って顔を上げた「まさにその瞬間」に、相手DFの視野の外（ブラインドサイド）から斜めに走り出せたのが最大の収穫です。スピードに乗った状態でパスを引き出せています。',
        improvement:
          'クロスがニアのDFに引っかかるのは、縦に抜いた後の「最後のタッチ」が足元の真下に入り、ボールを見ながら蹴っているためです。縦へ抜けるタッチを斜め前1.5mに置けば、蹴る前に0.5秒間ゴール前を見る時間が生まれます。',
        next_action:
          'サイド突破からのクロス練習で、蹴る1歩前のタッチを「斜め前方に押し出し、必ずファーサイドの味方をチラ見してから蹴る」ことを徹底する。',
      },
    },
    youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    timestamps: [
      {
        id: 'ts-4',
        timeStr: '06:10',
        seconds: 370,
        tag: 'Good',
        memo: 'SBが顔を上げた瞬間のダイアゴナルランで背後を取ったシーン',
      },
      {
        id: 'ts-5',
        timeStr: '14:50',
        seconds: 890,
        tag: '課題',
        memo: '縦突破後のクロスがニアDFに当たった場面（ファーが空いていた）',
      },
    ],
    createdAt: '2026-10-11T17:15:00.000Z',
  },
  {
    id: 'rec-2026-10-04',
    date: '2026-10-04',
    type: '練習',
    opponent: 'チーム紅白戦＆ポゼッション4対4＋2フリーマン',
    minutesPlayed: 60,
    condition: 4,
    spikeId: 'spike-asics-dslight-xfly',
    goodPlays:
      '4対4＋2フリーマンの狭いグリッドで、ワンタッチパスとツータッチを使い分けて一度もボールを失わなかった。股関節を折りたたんで低い姿勢でターンできた。',
    challenges:
      '守備の場面で相手がパス交換したときに足だけで飛び込んでしまい、ワンツーで簡単に背後を取られたシーンが2回あった。',
    aiAnalysis: {
      summary_title: '2軸の低い姿勢とワンタッチ判断で狭い局面を打開したトレーニング',
      four_pillars: {
        technical:
          '狭いエリアでのワンタッチ・ツータッチの使い分けと、相手の逆を取るターンの技術が安定していました。',
        tactical:
          '攻撃時のサポート角度（トライアングル形成）は良かったものの、守備時にパスコースを切りながら寄せるアプローチ角度に課題が残りました。',
        physical:
          '股関節を折りたたんだ低い重心でバランスを保てており、ターン時の初速もスムーズでした。',
        mental:
          'ミスを恐れず狭いスペースでもボールを受け続ける主体的な姿勢が見られました。',
      },
      scores: {
        technical: 4,
        tactical: 3,
        physical: 4,
        mental: 4,
      },
      coaching_feedback: {
        praise:
          '狭い4対4グリッドでボールを失わなかったのは、股関節を軽く折りたたんだ低い姿勢でいつでも両足に体重を乗せられる準備ができていたからです。',
        improvement:
          '守備でワンツーで抜かれた場面は、ボール保持者に近づく最後の2歩でスピードを緩めず、足先だけを出して重心が踵に残っていたのが原因です。相手の1.5m手前で小刻みなステップ（減速）を入れると、ワンツーの走り出しにも即座に反応できます。',
        next_action:
          '1対1や紅白戦の守備で「相手の間合い（1.5m手前）に入ったら小刻みステップで減速し、パスコースを片方切って構える」ことを意識する。',
      },
    },
    youtubeUrl: '',
    timestamps: [],
    createdAt: '2026-10-04T19:00:00.000Z',
  },
];

/**
 * Parses a timestamp string like "12:34" or "1:05:20" or "45" into total seconds.
 * Returns null if invalid.
 */
export function parseTimestampToSeconds(timeStr: string): number | null {
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':').map((p) => p.trim());
  if (parts.some((p) => !/^\d+$/.test(p))) {
    return null;
  }

  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.length === 1) {
    return nums[0];
  }
  if (nums.length === 2) {
    const [min, sec] = nums;
    if (sec >= 60) return null;
    return min * 60 + sec;
  }
  if (nums.length === 3) {
    const [hr, min, sec] = nums;
    if (min >= 60 || sec >= 60) return null;
    return hr * 3600 + min * 60 + sec;
  }
  return null;
}

/**
 * Formats seconds back into MM:SS or HH:MM:SS.
 */
export function formatSecondsToTimestamp(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Extracts a 11-character YouTube video ID from common YouTube URL formats.
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // Direct 11-char ID if passed
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (
        pathParts.length >= 2 &&
        ['embed', 'shorts', 'live', 'v'].includes(pathParts[0]) &&
        /^[a-zA-Z0-9_-]{11}$/.test(pathParts[1])
      ) {
        return pathParts[1];
      }
    }
  } catch {
    // Fallback regex
    const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  return null;
}

/**
 * Builds a YouTube embed URL with optional start seconds and autoplay.
 */
export function buildYoutubeEmbedUrl(url: string, startSeconds = 0, autoplay = false): string | null {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return null;

  const params = new URLSearchParams();
  params.set('rel', '0');
  if (startSeconds > 0) {
    params.set('start', Math.floor(startSeconds).toString());
  }
  if (autoplay) {
    params.set('autoplay', '1');
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Calculates usage count, total minutes, and maintenance guidelines for each registered spike.
 * Junior soccer spike guidelines:
 * - Every ~360 mins (6 hours): Maintenance check (cleaning, leather cream / stud check)
 * - Around ~1800 mins (30 hours) of hard play: Outsole wear & replacement check
 */
export function calculateSpikeUsage(spikes: SpikeGear[], records: MatchRecord[]): Record<string, SpikeUsageStats> {
  const statsMap: Record<string, SpikeUsageStats> = {};

  for (const spike of spikes) {
    const matchingRecords = records.filter((r) => r.spikeId === spike.id);
    const usageCount = matchingRecords.length;
    const totalMinutes = matchingRecords.reduce((sum, r) => sum + (Number(r.minutesPlayed) || 0), 0);

    const sortedDates = matchingRecords
      .map((r) => r.date)
      .filter(Boolean)
      .sort((a, b) => (a > b ? -1 : 1));

    const lastUsedDate = sortedDates.length > 0 ? sortedDates[0] : null;
    const wearPercentage = Math.min(100, Math.round((totalMinutes / 1800) * 100));

    let statusLevel: 'optimal' | 'maintenance' | 'replace' = 'optimal';
    let statusLabel = 'コンディション良好';

    if (totalMinutes >= 1500) {
      statusLevel = 'replace';
      statusLabel = 'ポイント摩耗・買い替え検討期';
    } else if (totalMinutes >= 300) {
      statusLevel = 'maintenance';
      statusLabel = 'お手入れ・保革ケア推奨';
    }

    statsMap[spike.id] = {
      spikeId: spike.id,
      usageCount,
      totalMinutes,
      lastUsedDate,
      statusLevel,
      statusLabel,
      wearPercentage,
    };
  }

  return statsMap;
}

/**
 * Calculates aggregated dashboard metrics across all match records.
 */
export function calculateDashboardStats(records: MatchRecord[]): DashboardSummary {
  if (records.length === 0) {
    return {
      totalMatches: 0,
      totalMinutes: 0,
      averageCondition: 0,
      averageScores: { technical: 0, tactical: 0, physical: 0, mental: 0 },
      overallAverageScore: 0,
      officialMatchCount: 0,
      practiceMatchCount: 0,
      trainingCount: 0,
    };
  }

  const totalMatches = records.length;
  const totalMinutes = records.reduce((sum, r) => sum + (Number(r.minutesPlayed) || 0), 0);
  const totalCond = records.reduce((sum, r) => sum + (Number(r.condition) || 0), 0);

  const sumTech = records.reduce((sum, r) => sum + (r.aiAnalysis?.scores?.technical || 0), 0);
  const sumTact = records.reduce((sum, r) => sum + (r.aiAnalysis?.scores?.tactical || 0), 0);
  const sumPhys = records.reduce((sum, r) => sum + (r.aiAnalysis?.scores?.physical || 0), 0);
  const sumMent = records.reduce((sum, r) => sum + (r.aiAnalysis?.scores?.mental || 0), 0);

  const round1 = (val: number) => Math.round(val * 10) / 10;

  const averageScores: FourPillarScores = {
    technical: round1(sumTech / totalMatches),
    tactical: round1(sumTact / totalMatches),
    physical: round1(sumPhys / totalMatches),
    mental: round1(sumMent / totalMatches),
  };

  const overallAverageScore = round1(
    (averageScores.technical + averageScores.tactical + averageScores.physical + averageScores.mental) / 4
  );

  return {
    totalMatches,
    totalMinutes,
    averageCondition: round1(totalCond / totalMatches),
    averageScores,
    overallAverageScore,
    officialMatchCount: records.filter((r) => r.type === '公式戦').length,
    practiceMatchCount: records.filter((r) => r.type === '練習試合').length,
    trainingCount: records.filter((r) => r.type === '練習').length,
  };
}

/**
 * Filters records by match type and search keyword.
 */
export function filterRecords(
  records: MatchRecord[],
  typeFilter: MatchType | 'ALL',
  keyword: string
): MatchRecord[] {
  const q = keyword.trim().toLowerCase();
  return records
    .filter((rec) => {
      if (typeFilter !== 'ALL' && rec.type !== typeFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        rec.opponent,
        rec.type,
        rec.date,
        rec.goodPlays,
        rec.challenges,
        rec.aiAnalysis?.summary_title,
        rec.aiAnalysis?.coaching_feedback?.next_action,
        ...(rec.timestamps || []).map((t) => t.memo),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    })
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
}

export interface RecordValidationResult {
  valid: boolean;
  error?: string;
}

export function validateNewRecord(input: {
  date: string;
  opponent: string;
  minutesPlayed: number;
  goodPlays: string;
  challenges: string;
}): RecordValidationResult {
  if (!input.date.trim()) {
    return { valid: false, error: '日付を入力してください。' };
  }
  if (!input.opponent.trim()) {
    return { valid: false, error: '対戦相手または練習メニュー名を入力してください。' };
  }
  if (isNaN(input.minutesPlayed) || input.minutesPlayed <= 0 || input.minutesPlayed > 300) {
    return { valid: false, error: '出場時間は1〜300分の間で入力してください。' };
  }
  if (!input.goodPlays.trim() && !input.challenges.trim()) {
    return { valid: false, error: '「良かったプレー」または「課題・悔しかったこと」を入力してください。' };
  }
  return { valid: true };
}

/**
 * Generates a realistic, specific coach analysis based on user reflection input when API fallback is needed.
 */
export function generateFallbackAnalysis(input: {
  type: MatchType;
  opponent: string;
  minutesPlayed: number;
  condition: number;
  goodPlays: string;
  challenges: string;
}): AIAnalysisResult {
  const good = input.goodPlays.trim() || '積極的な仕掛けとボールに関わる意識';
  const chal = input.challenges.trim() || 'プレッシャー下での判断スピードとファーストタッチの置き所';

  const hasPassOrTrap = /パス|トラップ|シュート|ドリブル|タッチ|ターン/.test(good + chal);
  const hasScanOrSpace = /首振り|視野|スペース|裏|ポジショニング|切り替え|予測/.test(good + chal);
  const hasPhysical = /走り|スプリント|体幹|フィジカル|バランス|疲れ|1対1/.test(good + chal);

  const techScore = Math.min(5, Math.max(3, hasPassOrTrap ? 4 : 3));
  const tactScore = Math.min(5, Math.max(3, hasScanOrSpace ? 4 : 3));
  const physScore = Math.min(5, Math.max(3, Math.round((input.condition + (hasPhysical ? 4 : 3)) / 2)));
  const mentScore = Math.min(5, Math.max(3, good.length > 25 ? 4 : 3));

  const titlePrefix = input.opponent.includes(input.type)
    ? input.opponent
    : `${input.opponent}（${input.type}）`;

  return {
    summary_title: `${titlePrefix}：成功体験を再現し課題を次へ繋げる振り返り`,
    four_pillars: {
      technical: `【良かった点】${good.slice(0, 60)}におけるボールタッチと技術の再現性が光りました。【改善点】${chal.slice(0, 60)}の局面では、受ける前の半身の作り方とファーストタッチを置く位置（足元に入りすぎない斜め前1m）を整理するとさらに精度が上がります。`,
      tactical: `ボールが移動している最中に首を振って周囲（相手DFの重心と味方のサポート角度）を認知するタイミングが重要です。攻守の切り替え（トランジション）で最初の3歩を素早く踏み出すことで、常に先手を取れるようになります。`,
      physical: `${input.minutesPlayed}分間のプレー（コンディション${input.condition}/5）の中で、コンタクト時やターン時に股関節を軽く折りたたんだ「2軸の姿勢」を保つことで、後半の疲労時でも初速のキレとボディバランスを維持できます。`,
      mental: `自分の言葉で「できたこと」と「悔しかったこと」を具体的に言語化できていること自体が成長の証です。ミスが起きた直後の3秒間で気持ちを切り替えて次のプレーに関わり続けましょう。`,
    },
    scores: {
      technical: techScore,
      tactical: tactScore,
      physical: physScore,
      mental: mentScore,
    },
    coaching_feedback: {
      praise: `「${good.slice(0, 70)}」というプレーは、偶然ではなく準備と判断が噛み合った素晴らしい成功体験です。どういったタイミング・身体の向きでそのプレーができたのか、その感覚をしっかり自分の武器として記憶に残しましょう。`,
      improvement: `「${chal.slice(0, 70)}」の課題を解決する鍵は、ボールが自分の足元に来てから考えるのではなく、味方がパスを出す直前の「0.5秒前」に相手の位置をチラ見してファーストタッチの方向を決めておくことです。`,
      next_action: `次の練習の最初のゲーム形式から「パスを受ける前に必ず1回首を振り、ファーストタッチを自分の前方のスペースへ置く」ことだけに集中してトライする。`,
    },
  };
}
