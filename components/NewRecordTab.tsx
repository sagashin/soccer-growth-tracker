'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  Target,
  TrendingUp,
  Award,
  Save,
  Smile,
  Meh,
  Frown,
  Zap,
  BatteryLow,
  Loader2,
  FileText,
  Key,
  Settings,
  Cpu,
  AlertCircle,
} from 'lucide-react';
import {
  AIAnalysisResult,
  MatchRecord,
  MatchType,
  SpikeGear,
  VideoTimestamp,
  generateFallbackAnalysis,
  validateNewRecord,
} from '@/lib/soccer-tracker';
import {
  analyzeMatchReflection,
  getStoredApiKey,
  setStoredApiKey,
} from '@/lib/gemini-client';
import GeminiApiKeyModal from './GeminiApiKeyModal';
import RadarChart from './RadarChart';
import YoutubeTimestampPlayer from './YoutubeTimestampPlayer';

interface NewRecordTabProps {
  spikes: SpikeGear[];
  onSaveRecord: (record: MatchRecord) => void;
  onNavigateToDashboard: () => void;
}

const CONDITION_LEVELS = [
  { value: 1, label: '1: 疲労大', icon: BatteryLow },
  { value: 2, label: '2: 重い', icon: Frown },
  { value: 3, label: '3: 普通', icon: Meh },
  { value: 4, label: '4: 好調', icon: Smile },
  { value: 5, label: '5: 絶好調', icon: Zap },
];

const MATCH_TYPES: MatchType[] = ['公式戦', '練習試合', '練習'];

export default function NewRecordTab({
  spikes,
  onSaveRecord,
  onNavigateToDashboard,
}: NewRecordTabProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(todayStr);
  const [type, setType] = useState<MatchType>('公式戦');
  const [opponent, setOpponent] = useState<string>('');
  const [minutesPlayed, setMinutesPlayed] = useState<number>(40);
  const [condition, setCondition] = useState<number>(4);
  const [spikeId, setSpikeId] = useState<string>(spikes[0]?.id || '');

  const [goodPlays, setGoodPlays] = useState<string>('');
  const [challenges, setChallenges] = useState<string>('');

  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([]);

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Gemini API key & Source State
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
  const [apiSaveMsg, setApiSaveMsg] = useState<string>('');
  const [aiSource, setAiSource] = useState<'gemini' | 'smart_fallback' | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [analysisWarning, setAnalysisWarning] = useState<string>('');

  useEffect(() => {
    const key = getStoredApiKey();
    setApiKeyInput(key);
    setHasApiKey(Boolean(key));
  }, []);

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKeyInput);
    const saved = Boolean(apiKeyInput.trim());
    setHasApiKey(saved);
    setApiSaveMsg(
      saved
        ? 'APIキーを保存しました！Gemini AI分析が有効です。'
        : 'APIキーを削除しました。内蔵スマート分析が有効です。'
    );
    setTimeout(() => setApiSaveMsg(''), 3000);
  };

  // Web Speech API state
  const [listeningField, setListeningField] = useState<'good' | 'challenges' | null>(null);
  const [speechError, setSpeechError] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const toggleVoiceInput = (field: 'good' | 'challenges') => {
    setSpeechError('');
    if (listeningField === field) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListeningField(null);
      return;
    }

    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechError('お使いのブラウザは音声入力(Web Speech API)に対応していません。');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.continuous = false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          if (field === 'good') {
            setGoodPlays((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } else {
            setChallenges((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setSpeechError(`音声認識エラー: ${event.error || 'マイク権限を確認してください'}`);
        setListeningField(null);
      };

      recognition.onend = () => {
        setListeningField(null);
      };

      recognitionRef.current = recognition;
      setListeningField(field);
      recognition.start();
    } catch {
      setSpeechError('音声入力を開始できませんでした。');
      setListeningField(null);
    }
  };

  const handleFillSampleInput = () => {
    setFormError('');
    setOpponent('横浜マリノスプライマリー追浜（練習試合）');
    setType('練習試合');
    setMinutesPlayed(40);
    setCondition(4);
    setGoodPlays(
      '前半8分に中盤でボールを受ける前、右肩越しに首を振って相手ボランチの位置を確認し、左足のワンタッチで逆サイドのスペースへ展開できた。'
    );
    setChallenges(
      '後半12分、ゴール前のこぼれ球に反応したときに体が後ろに倒れてシュートが枠の上に外れた。また相手の寄せが速い場面でボールを足元に置きすぎて奪われた。'
    );
    setYoutubeUrl('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
    setTimestamps([
      {
        id: `ts-sample-1`,
        timeStr: '08:15',
        seconds: 495,
        tag: 'Good',
        memo: '事前スキャンから左足ワンタッチで逆サイドへ展開',
      },
      {
        id: `ts-sample-2`,
        timeStr: '12:34',
        seconds: 754,
        tag: '課題',
        memo: 'こぼれ球のシュートで上体が反って枠外に外れたシーン',
      },
    ]);
  };

  const runAiAnalysis = async (): Promise<AIAnalysisResult | null> => {
    setFormError('');
    if (!goodPlays.trim() && !challenges.trim()) {
      setFormError('AIコーチ分析を実行するには「良かったプレー」または「課題・悔しかったこと」を入力してください。');
      return null;
    }

    setIsAnalyzing(true);
    try {
      const selectedSpike = spikes.find((s) => s.id === spikeId);
      const res = await analyzeMatchReflection({
        date,
        type,
        opponent: opponent || '対戦相手',
        minutesPlayed: Number(minutesPlayed) || 40,
        condition: Number(condition) || 4,
        spikeName: selectedSpike ? `${selectedSpike.brand} ${selectedSpike.modelName}` : '',
        goodPlays,
        challenges,
      });

      setAiAnalysis(res.analysis);
      setAiSource(res.source);
      setModelUsed(res.modelUsed || '');
      if (res.source === 'smart_fallback' && res.errorMessage) {
        setAnalysisWarning(`Gemini API接続失敗 (${res.errorMessage}) のため、内蔵スマートAIで完了しました。API設定で「接続テスト」をご確認ください。`);
      } else {
        setAnalysisWarning('');
      }
      return res.analysis;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'AIコーチ分析の取得に失敗しました。');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaveSuccessMsg('');

    const validation = validateNewRecord({
      date,
      opponent,
      minutesPlayed: Number(minutesPlayed),
      goodPlays,
      challenges,
    });

    if (!validation.valid) {
      setFormError(validation.error || '入力内容を確認してください。');
      return;
    }

    let finalAnalysis = aiAnalysis;
    if (!finalAnalysis) {
      finalAnalysis = await runAiAnalysis();
      if (!finalAnalysis) return;
    }

    const newRecord: MatchRecord = {
      id: `rec-${Date.now()}`,
      date,
      type,
      opponent: opponent.trim(),
      minutesPlayed: Number(minutesPlayed),
      condition,
      spikeId: spikeId || (spikes[0]?.id ?? ''),
      goodPlays: goodPlays.trim(),
      challenges: challenges.trim(),
      aiAnalysis: finalAnalysis,
      youtubeUrl: youtubeUrl.trim(),
      timestamps,
      createdAt: new Date().toISOString(),
    };

    onSaveRecord(newRecord);
    setSaveSuccessMsg('振り返り記録を保存しました！ダッシュボードとスパイク使用時間に反映されました。');
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full overflow-x-hidden">
      {/* Left Column: Input Form & Video (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Section 1: Basic Match Info */}
        <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                01. 基本情報とコンディション
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                試合・練習の基本データと使用したスパイクを選択してください
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillSampleInput}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 border border-slate-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>記入例を自動セット</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="match-date" className="block text-xs font-medium text-slate-300 mb-1.5">
                日付
              </label>
              <input
                id="match-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Match Type */}
            <div className="sm:col-span-2">
              <span className="block text-xs font-medium text-slate-300 mb-1.5">
                種別
              </span>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {MATCH_TYPES.map((t) => {
                  const active = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Opponent & Minutes Played */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label htmlFor="match-opponent" className="block text-xs font-medium text-slate-300 mb-1.5">
                対戦相手 / 練習テーマ
              </label>
              <input
                id="match-opponent"
                type="text"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="例: FCバロンドールU-15 / ポゼッション＆紅白戦"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="match-minutes" className="block text-xs font-medium text-slate-300 mb-1.5">
                出場・プレー時間 (分)
              </label>
              <input
                id="match-minutes"
                type="number"
                min={1}
                max={300}
                value={minutesPlayed}
                onChange={(e) => setMinutesPlayed( parseInt(e.target.value, 10) || 0 )}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Condition 5-stage selector & Spike dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
            <div className="sm:col-span-7">
              <span className="block text-xs font-medium text-slate-300 mb-1.5">
                コンディション (5段階)
              </span>
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                {CONDITION_LEVELS.map((lvl) => {
                  const Icon = lvl.icon;
                  const active = condition === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setCondition(lvl.value)}
                      aria-label={`コンディション ${lvl.label}`}
                      className={`min-h-[48px] py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all min-w-0 overflow-hidden ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-mono tabular-nums font-medium text-center truncate max-w-full">
                        {lvl.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-5">
              <label htmlFor="spike-select" className="block text-xs font-medium text-slate-300 mb-1.5">
                使用スパイク（累計時間を自動集計）
              </label>
              <select
                id="spike-select"
                value={spikeId}
                onChange={(e) => setSpikeId(e.target.value)}
                className="w-full min-h-[48px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {spikes.map((spike) => (
                  <option key={spike.id} value={spike.id}>
                    {spike.brand} — {spike.modelName} ({spike.sizeCm}cm)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Reflection Memos & Voice Input */}
        <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-800/80 pb-3.5">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              02. プレー振り返りメモ（音声入力対応）
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              「いつ・どこで・どう動いたか」を自分の言葉でメモすると、AI専属コーチが4軸で精密に分析します
            </p>
          </div>

          {speechError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              {speechError}
            </div>
          )}

          {/* Good Plays */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="good-plays-textarea" className="text-xs font-semibold text-emerald-400">
                良かったプレー・通用したこと
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('good')}
                aria-label="良かったプレーを音声入力する"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  listeningField === 'good'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {listeningField === 'good' ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>音声認識中... 停止</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>マイクで音声入力</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              id="good-plays-textarea"
              rows={3}
              value={goodPlays}
              onChange={(e) => setGoodPlays(e.target.value)}
              placeholder="例: パスを受ける前に2回首を振って相手DFの位置を確認し、左足のファーストタッチで前を向いてスルーパスを通せた。"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Challenges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="challenges-textarea" className="text-xs font-semibold text-sky-400">
                課題・悔しかったこと・次直したいこと
              </label>
              <button
                type="button"
                onClick={() => toggleVoiceInput('challenges')}
                aria-label="課題を音声入力する"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  listeningField === 'challenges'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {listeningField === 'challenges' ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>音声認識中... 停止</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-sky-400" />
                    <span>マイクで音声入力</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              id="challenges-textarea"
              rows={3}
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="例: ペナルティエリア手前でフリーになった場面で、焦ってシュートが浮いてしまった。終盤の1対1で体が流れた。"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* AI Mode Banner & Quick Key Config */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {hasApiKey ? (
                <>
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs truncate">
                    <span className="font-bold text-emerald-300">Gemini 3.8 Flash 連携中</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline ml-1.5">（個別AI読解モード）</span>
                  </div>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="text-xs truncate">
                    <span className="font-semibold text-slate-200">内蔵スマートAIモード</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline ml-1.5">（APIキー不要）</span>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowApiSettings(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition flex items-center gap-1 shrink-0"
            >
              <Key className="w-3 h-3 text-emerald-400" />
              <span>{hasApiKey ? 'キー変更' : 'Geminiキー設定'}</span>
            </button>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={runAiAnalysis}
              disabled={isAnalyzing}
              className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 disabled:opacity-60 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer whitespace-nowrap"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI専属コーチが4軸分析＆フィードバックを作成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AIコーチに分析してもらう（4軸スコア＆具体策を生成）</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Section 3: YouTube Video & Timestamps */}
        <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-800/80 pb-3.5">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              03. YouTube試合動画＆タイムスタンプ連携
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              動画URLと秒数メモ（例 12:34）を登録すると、ワンクリックでそのプレー場面から再生できます
            </p>
          </div>

          <YoutubeTimestampPlayer
            youtubeUrl={youtubeUrl}
            onYoutubeUrlChange={setYoutubeUrl}
            timestamps={timestamps}
            onTimestampsChange={setTimestamps}
          />
        </section>
      </div>

      {/* Right Column: AI Coach Structured Feedback Card & Save Action (5 cols) */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
        <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-800/80 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI専属コーチの構造化分析レポート
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                技術・戦術・フィジカル・メンタルの4軸評価と次へのアクション
              </p>
            </div>

            {/* Status Badge & Settings Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {hasApiKey ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Gemini AI 連携中
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  内蔵スマートAI
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowApiSettings(true)}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
                title="Gemini API設定"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="text-[11px]">設定</span>
              </button>
            </div>
          </div>



          {isAnalyzing && (
            <div className="space-y-4 py-6">
              <div className="h-6 w-3/4 bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-48 w-full bg-slate-800/60 rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-24 bg-slate-800/60 rounded-xl animate-pulse" />
              </div>
            </div>
          )}

          {!isAnalyzing && !aiAnalysis && (
            <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-6 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  振り返りメモを入力して「AIコーチに分析してもらう」を押してください
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  JFAジュニアユース（U-15）年代の指導理論に基づき、「いつ・どこで・どう動くか」に焦点を当てた4軸スコアと具体的な改善アクションを表示します。
                </p>
              </div>
            </div>
          )}

          {!isAnalyzing && aiAnalysis && (
            <div className="space-y-5" data-testid="ai-analysis-result">
              {analysisWarning && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{analysisWarning}</span>
                </div>
              )}
              {/* Summary Title */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-emerald-400">
                    振り返りの一言タイトル
                  </span>
                  {aiSource === 'gemini' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-semibold">
                      <Zap className="w-2.5 h-2.5 text-emerald-400" />
                      Gemini AI 稼働中 (Live: {modelUsed || 'Flash'})
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 font-semibold">
                      <Cpu className="w-2.5 h-2.5 text-blue-400" />
                      内蔵スマートAI
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {aiAnalysis.summary_title}
                </h3>
              </div>

              {/* 4-Axis Radar Chart & Scores */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <RadarChart scores={aiAnalysis.scores} size={220} />
              </div>

              {/* 4 Pillars Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-300">
                  4軸でのプレー整理（Four Pillars）
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      key: 'technical' as const,
                      title: '技術 (Technical)',
                      score: aiAnalysis.scores.technical,
                      accent: 'text-emerald-400',
                    },
                    {
                      key: 'tactical' as const,
                      title: '戦術 (Tactical)',
                      score: aiAnalysis.scores.tactical,
                      accent: 'text-sky-400',
                    },
                    {
                      key: 'physical' as const,
                      title: 'フィジカル (Physical)',
                      score: aiAnalysis.scores.physical,
                      accent: 'text-teal-400',
                    },
                    {
                      key: 'mental' as const,
                      title: 'メンタル (Mental)',
                      score: aiAnalysis.scores.mental,
                      accent: 'text-blue-400',
                    },
                  ].map((pillar) => (
                    <div
                      key={pillar.key}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${pillar.accent}`}>
                          {pillar.title}
                        </span>
                        <span className="font-mono tabular-nums text-slate-300 font-semibold">
                          評価 {pillar.score}/5
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {aiAnalysis.four_pillars[pillar.key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coaching Feedback: Praise, Improvement, Next Action */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300">
                  専属AIコーチからの論理的アドバイス
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>良かった点への称賛（Praise）</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {aiAnalysis.coaching_feedback.praise}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>課題への改善アプローチ（Improvement）</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {aiAnalysis.coaching_feedback.improvement}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Target className="w-4 h-4 shrink-0" />
                    <span>次の練習・試合で意識する「たった1つの具体的アクション目標」</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                    {aiAnalysis.coaching_feedback.next_action}
                  </p>
                </div>
              </div>
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300"
            >
              {formError}
            </div>
          )}

          {saveSuccessMsg && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 space-y-2"
            >
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="text-xs font-semibold text-emerald-300 underline hover:text-emerald-200"
              >
                ダッシュボード＆成長ログで確認する →
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>この振り返り記録を保存する</span>
          </button>
        </section>
      </div>
      {/* Modal for setting API key */}
      <GeminiApiKeyModal
        isOpen={showApiSettings}
        onClose={() => setShowApiSettings(false)}
        onKeySaved={() => {
          const key = getStoredApiKey();
          setHasApiKey(Boolean(key));
        }}
      />
    </form>
  );
}
