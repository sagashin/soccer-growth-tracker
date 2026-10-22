'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Zap, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, testGeminiApiKey } from '@/lib/gemini-client';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export default function GeminiApiKeyModal({
  isOpen,
  onClose,
  onKeySaved,
}: GeminiApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [msg, setMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setApiKey(stored);
      setHasExistingKey(Boolean(stored));
      setMsg('');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: 'APIキーを入力してください。' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testGeminiApiKey(apiKey);
      if (result.ok) {
        setTestResult({
          ok: true,
          message: `接続成功！Google Gemini AI (${result.model}) が正常に応答しました。`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `接続失敗: ${result.error}`,
        });
      }
    } catch (e) {
      setTestResult({
        ok: false,
        message: 'ネットワーク接続エラーが発生しました。',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setStoredApiKey(apiKey);
    const saved = Boolean(apiKey.trim());
    setHasExistingKey(saved);
    setMsg(
      saved
        ? 'APIキーを保存しました！Gemini AI分析が有効になりました。'
        : 'APIキーを削除しました。内蔵スマートAIモードで動作します。'
    );
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleDelete = () => {
    setApiKey('');
    setStoredApiKey('');
    setHasExistingKey(false);
    setTestResult(null);
    setMsg('APIキーを削除しました。内蔵スマートAIモードで動作します。');
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <span>Gemini API キー設定</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                完全無料
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Google最新AIによる完全個別読解コーチング
            </p>
          </div>
        </div>

        {/* Description Box */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Google AI Studio で無料取得した <strong>Gemini API キー</strong> を入力すると、世界最高峰の生成AI（Gemini Flash）があなたの振り返りメモを深く分析し、専属コーチとしてアドバイスを出力します。
          </p>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">※未設定時は「内蔵スマートAI」が動作</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-0.5 text-xs"
            >
              無料キーを取得 ↗
            </a>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              API キー（AIzaSy...）
            </label>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 disabled:opacity-50 font-medium underline flex items-center gap-1 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>接続テスト中...</span>
                </>
              ) : (
                <span>🔍 接続テストを実行</span>
              )}
            </button>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setTestResult(null);
            }}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            autoFocus
          />
          <p className="text-[11px] text-slate-500">
            ※キーはお使いのブラウザ内部（localStorage）にのみ安全に保存され、外部サーバーには一切送信されません。
          </p>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              testResult.ok
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.ok ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Status Message */}
        {msg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-950/50"
          >
            保存して有効化
          </button>
          {hasExistingKey && (
            <button
              type="button"
              onClick={handleDelete}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-xs font-semibold transition border border-slate-700"
            >
              削除
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
