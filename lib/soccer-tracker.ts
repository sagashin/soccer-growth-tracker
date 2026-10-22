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
    opponent: 'FCバロンドールU-15（後期リーグ第4節）',
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
    opponent: '青葉台ジュニアユースFC（15分×3本）',
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
  const good = input.goodPlays.trim();
  const chal = input.challenges.trim();
  const allText = `${good} ${chal}`;

  // --- Category Detectors ---
  const isShoot = /シュート|ゴール|得点|決定力|枠|ミドル|ボレー|キーパー|押し込|ネット/.test(allText);
  const isDribble = /ドリブル|仕掛け|1対1|フェイント|突破|カットイン|かわす|抜き|抜かれ|突っ込/.test(allText);
  const isPass = /パス|スルーパス|アシスト|ワンツー|クロス|センタリング|展開|ロング|ショート|繋ぎ|通ら|カット|ズレ/.test(allText);
  const isTrap = /トラップ|ファーストタッチ|コントロール|浮き球|収める|こぼす|弾く|足元|タッチ/.test(allText);
  const isDefense = /守備|ディフェンス|奪う|インターセプト|寄せる|カバー|マーク|ブロック|クリア|抜かれた|裏を取られ/.test(allText);
  const isVision = /首振り|視野|スキャン|周り|見る|見えて|気づ|認知|状況|確認/.test(allText);
  const isPosition = /ポジショニング|スペース|裏|幅|サポート|角度|距離|孤立|顔を出す|落ちる/.test(allText);
  const isTransition = /切り替え|トランジション|攻守|奪われた後|奪った後|カウンター/.test(allText);
  const isStamina = /スタミナ|体力|後半|バテ|疲れ|走れな|足がつ|重い/.test(allText);
  const isContact = /当たり負け|フィジカル|体幹|競り合い|バランス|倒され|パワー|ふっ飛ば/.test(allText);
  const isMentalWeak = /弱気|怖が|焦り|慌て|自信|消極的|迷い|緊張|引いて/.test(chal);
  const isVoice = /声|声出し|指示|呼ぶ|コミュニケーション/.test(allText);

  // --- Dynamic Topic Detection for Title & Main Focus ---
  let mainTopic = '総合的プレー';
  if (isShoot) mainTopic = 'シュート決定力とフィニッシュワーク';
  else if (isDribble) mainTopic = '1対1の仕掛けと間合いの勝負';
  else if (isPass) mainTopic = 'パスの配球と判断スピード';
  else if (isTrap) mainTopic = 'ファーストタッチとコントロール技術';
  else if (isDefense) mainTopic = 'ボール奪取と守備のポジショニング';
  else if (isVision) mainTopic = '首振りと周囲の状況把握';

  const titlePrefix = input.opponent.includes(input.type)
    ? input.opponent
    : `${input.opponent}（${input.type}）`;
  const summary_title = `${titlePrefix}：${mainTopic}に焦点を当てた振り返り`;

  // --- Dynamic Praise Generation ---
  let praiseText = '';
  if (isShoot && /シュート|ゴール|得点/.test(good)) {
    praiseText = `「${good.slice(0, 50)}」の場面では、ボールに対して迷わず踏み込み、枠を捉えるイメージを持てていたことが素晴らしい結果に結びついています。フィニッシュの感覚を大切にしてください。`;
  } else if (isDribble && /ドリブル|仕掛け|1対1|抜/.test(good)) {
    praiseText = `「${good.slice(0, 50)}」で見せた仕掛けは、相手DFの重心の逆を突き、加速するタイミングが的確でした。自信を持って自分の間合いで勝負できています。`;
  } else if (isPass && /パス|アシスト|スルー/.test(good)) {
    praiseText = `「${good.slice(0, 50)}」のパスは、味方の走るスピードとスペースを見極めた素晴らしい判断です。視野の広さと丁寧なボールタッチの賜物です。`;
  } else if (isDefense && /守備|奪|インターセプト|寄せ/.test(good)) {
    praiseText = `「${good.slice(0, 50)}」の守備では、相手の次のプレーを予測して先手を打つ鋭いアプローチが光りました。チームに大きな流れを引き寄せる好プレーです。`;
  } else if (good) {
    praiseText = `「${good.slice(0, 55)}」をやりきれたことは、日頃の基礎練習の成果がピッチ上で発揮できた証拠です。この成功の身体感覚を忘れずに武器として磨きましょう。`;
  } else {
    praiseText = '試合を通じて積極的に関わり、自分のプレーを振り返る姿勢自体が着実な成長に繋がっています。';
  }

  // --- Dynamic Improvement & Next Action Generation ---
  let improvementText = '';
  let nextActionText = '';

  if (isShoot && /外|枠|決まら|キーパー/.test(chal)) {
    improvementText = `「${chal.slice(0, 55)}」の改善には、シュート直前の0.5秒でGKの立ち位置を間接視野で確認し、力みを抜いてインサイドや狙いすましたコースへ流し込む意識が効果的です。`;
    nextActionText = 'シュート練習やミニゲームで、打つ直前にGKの位置をチラ見して逆サイドネットを狙う';
  } else if (isDribble && /取られ|引っかか|突っ込/.test(chal)) {
    improvementText = `「${chal.slice(0, 55)}」の課題は、相手の正面に突っ込まず、まず斜め前へ半歩ボールを運んで相手の重心を動かしてから逆を突く「間合いのコントロール」で解決できます。`;
    nextActionText = 'ボールを持ったら相手に近づきすぎず、腕1本分の間合いで左右に揺さぶってから加速する';
  } else if (isPass && /ズレ|通ら|カット|取られ/.test(chal)) {
    improvementText = `「${chal.slice(0, 55)}」の場面では、蹴る瞬間に軸足のつま先がターゲットをしっかり向いているかと、味方が走り込むスペースへボールの勢いを合わせる配慮がポイントです。`;
    nextActionText = 'パスを出す前に軸足の向きを意識し、味方の利き足の前へ届くグラウンダーのパスを通す';
  } else if (isTrap && /トラップ|弾|こぼ|足元/.test(chal)) {
    improvementText = `「${chal.slice(0, 55)}」の局面では、足元でピタッと止めるだけでなく、次にパスや前を向ける「斜め前1m」のオープンスペースにワンアクションで置くファーストタッチを整理しましょう。`;
    nextActionText = 'パスを受ける前に周囲を見て、次のプレー方向にボールを1タッチで前へ運ぶ';
  } else if (isDefense && /抜かれ|裏|遅れ|飛び込/.test(chal)) {
    improvementText = `「${chal.slice(0, 55)}」の守備課題は、相手に一気に飛び込まず、半身の姿勢（前後のステップ）を崩さずに相手の得意足を消して外側へ誘導することが鉄則です。`;
    nextActionText = '相手と対峙した時は飛び込まず、腕1本分の距離を保ちながら半身で相手を外へ追い込む';
  } else if (isStamina) {
    improvementText = `「${chal.slice(0, 55)}」の疲労課題に対しては、全速力で追い続けるだけでなく、味方のサポート位置と陣形を見ながら「行くべき時」と「ステイする時」のメリハリをつけましょう。`;
    nextActionText = 'プレーが止まった短い時間で深呼吸し、常に全力ではなくメリハリのあるポジショニングを意識する';
  } else if (isVision || /首振り|見え/.test(chal)) {
    improvementText = `「${chal.slice(0, 55)}」を防ぐには、ボールが味方の足元を離れて自分に届く「球足の移動中」に素早く1回首を振って周囲の敵とスペースを確認する習慣が不可欠です。`;
    nextActionText = 'ボールが自分に向かって転がってくる間に、必ず1回首を振って相手DFの位置を見る';
  } else if (isMentalWeak) {
    improvementText = `「${chal.slice(0, 55)}」という悔しさは次の糧です。ミスをしても下を向かず、最初の3秒ですぐに次のポジションを取り直す「ポジティブな切り替え」を心がけましょう。`;
    nextActionText = 'ミスした直後の3秒間ですぐに次の守備やサポートへ動き出す';
  } else {
    improvementText = `「${chal.slice(0, 55) || 'プレッシャー下でのプレー'}」の課題は、受ける前の準備動作（半身の構えと味方との距離感）をワンテンポ早く始めることで大きく改善されます。`;
    nextActionText = 'ボールを受ける前の「準備動作」を0.5秒早く開始し、次の選択肢を2つ以上持っておく';
  }

  // --- Dynamic Four Pillars ---
  // 1. Technical
  let techPillar = '';
  if (isShoot || isPass) {
    techPillar = `ボールインパクト時の軸足の安定と、インサイド・インステップの芯で捉える技術の再現性がポイントです。練習では助走の角度を一定に保つドリルを反復しましょう。`;
  } else if (isDribble || isTrap) {
    techPillar = `足首の脱力と、小指球・親指球を使った繊細なタッチでボールを常にコントロール下に置く技術が光ります。ファーストタッチの置き所を常に最適化しましょう。`;
  } else if (isDefense) {
    techPillar = `ボールを奪いに行く瞬間の足の出し方と、相手とボールの間に半身を滑り込ませる身体の使い方が技術的なカギとなります。`;
  } else {
    techPillar = `基本となるボールタッチの柔らかさと、プレッシャー下でもブレない足元のコントロールを継続して磨きましょう。`;
  }

  // 2. Tactical
  let tactPillar = '';
  if (isVision) {
    tactPillar = `ボールだけでなく「相手の重心・味方の距離・裏のスペース」の3つを同時に把握するスキャンの頻度を高めることで、プレーの選択肢が格段に広がります。`;
  } else if (isPosition) {
    tactPillar = `味方と相手DFの間（ギャップ）や相手の背後など、相手が最も嫌がるスペースへ常に顔を出し直すオフザボールの動き直しが重要です。`;
  } else if (isTransition) {
    tactPillar = `攻守が切り替わった最初の3歩を素早く動くことで、相手のリアクションより常に先手を取ることができます。`;
  } else {
    tactPillar = `周囲の状況を認知し、ボールを受ける前に「前を向く」「パスを出す」「やり直す」の優先順位を明確にしておくことが戦術的判断を高めます。`;
  }

  // 3. Physical
  let physPillar = '';
  const cond = Number(input.condition) || 3;
  if (cond <= 2) {
    physPillar = `コンディション${cond}/5の疲労がある中での${input.minutesPlayed}分間のプレーでした。股関節周りのストレッチと疲労回復を最優先し、体幹を意識した姿勢で身体の負担を軽減しましょう。`;
  } else if (isContact) {
    physPillar = `相手とのコンタクト時に上体を少し前傾させ、股関節を軽く落とした「2軸の姿勢」を保つことで、当たり負けせずにボールをキープできます。`;
  } else if (input.minutesPlayed >= 50) {
    physPillar = `${input.minutesPlayed}分間のフル稼働でもプレーの質を落とさないよう、後半の疲労時ほど初速の一歩目をコンパクトに踏み出す効率的な身体操作を意識しましょう。`;
  } else {
    physPillar = `コンディション${cond}/5を活かし、アジリティとクイックネス（敏捷性）を活かした素早い方向転換とダッシュ力を維持できています。`;
  }

  // 4. Mental
  let mentPillar = '';
  if (isMentalWeak) {
    mentPillar = `失敗を恐れず果敢に挑んだ経験は大きな収穫です。「ミス＝次の成功のヒント」と捉え、胸を張って次のプレーにチャレンジする強気なメンタルを育みましょう。`;
  } else if (isVoice) {
    mentPillar = `ピッチ内外での声出しやコミュニケーションは、自分だけでなくチーム全体の集中力を高める大きなリーダーシップです。`;
  } else {
    mentPillar = `自分のプレーの長所と課題をしっかりと客観的に振り返ることができており、向上心とメンタルの充実度が高い状態にあります。`;
  }

  // --- Dynamic Scores Calculation (1 - 5 range) ---
  const goodLen = good.length;
  const chalLen = chal.length;

  let techScore = 3;
  if (isShoot || isDribble || isPass || isTrap) {
    techScore = goodLen > 15 ? 4 : 3;
    if (goodLen > 40 && !/ミス|失敗|全然/.test(good)) techScore = 5;
  }
  if (/全く|全然|ヘタクソ|ミスばかり/.test(chal)) techScore = Math.max(2, techScore - 1);

  let tactScore = 3;
  if (isVision || isPosition || isTransition) tactScore = 4;
  if (goodLen > 30 && chalLen > 30) tactScore = Math.min(5, tactScore + 1);
  if (/見えてない|気づかない|孤立/.test(chal)) tactScore = Math.max(2, tactScore - 1);

  let physScore = cond;
  if (isStamina && chalLen > 10) physScore = Math.max(2, Math.min(4, cond - 1));
  if (cond >= 4 && !isStamina) physScore = Math.min(5, cond);

  let mentScore = 3;
  if (goodLen > 20) mentScore += 1;
  if (isVoice) mentScore += 1;
  if (isMentalWeak) mentScore = Math.max(2, mentScore - 1);
  mentScore = Math.max(1, Math.min(5, mentScore));

  return {
    summary_title,
    four_pillars: {
      technical: techPillar,
      tactical: tactPillar,
      physical: physPillar,
      mental: mentPillar,
    },
    scores: {
      technical: techScore,
      tactical: tactScore,
      physical: physScore,
      mental: mentScore,
    },
    coaching_feedback: {
      praise: praiseText,
      improvement: improvementText,
      next_action: nextActionText,
    },
  };
}
