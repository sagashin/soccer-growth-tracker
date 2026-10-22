'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import {
  fetchFamilyAuthConfig,
  setupInitialPasskey,
  verifyPasskey,
  getStoredPasskey,
  FamilyAuthConfig,
} from '@/lib/auth-store';

interface FamilyAuthModalProps {
  onAuthenticated: (familyKey: string, passkey: string) => void;
}

export default function FamilyAuthModal({ onAuthenticated }: FamilyAuthModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [config, setConfig] = useState<FamilyAuthConfig | null>(null);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean>(false);

  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [hintInput, setHintInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      setLoading(true);
      setErrorMessage('');

      try {
        const authConfig = await fetchFamilyAuthConfig();
        if (!isMounted) return;

        // Check if passkey is provided via URL parameter: ?pass=xxx
        let urlPasskey: string | null = null;
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          urlPasskey = params.get('pass');
        }

        // Check if passkey is already saved in localStorage
        const storedPasskey = getStoredPasskey();

        if (!authConfig || !authConfig.isConfigured) {
          // Brand new: initial setup needed
          setIsFirstTimeSetup(true);
          setConfig(null);
          setLoading(false);
          return;
        }

        setConfig(authConfig);
        setIsFirstTimeSetup(false);

        // Try auto-login with URL parameter first
        if (urlPasskey) {
          const res = await verifyPasskey(urlPasskey, authConfig);
          if (res.isValid) {
            // Clean URL query param without refreshing
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
            onAuthenticated(res.familyKey, urlPasskey);
            return;
          }
        }

        // Try auto-login with stored passkey
        if (storedPasskey) {
          const res = await verifyPasskey(storedPasskey, authConfig);
          if (res.isValid) {
            onAuthenticated(res.familyKey, storedPasskey);
            return;
          }
        }

        // Neither worked or not present: show login form
        setLoading(false);
      } catch (err) {
        console.warn('Auth check error:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [onAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyInput.trim()) {
      setErrorMessage('合言葉を入力してください。');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      if (isFirstTimeSetup) {
        // Create initial passkey
        const { familyKey } = await setupInitialPasskey(passkeyInput, hintInput);
        onAuthenticated(familyKey, passkeyInput.trim());
      } else if (config) {
        // Verify against existing passkey
        const res = await verifyPasskey(passkeyInput, config);
        if (res.isValid) {
          onAuthenticated(res.familyKey, passkeyInput.trim());
        } else {
          setErrorMessage('合言葉が一致しません。ご家族で共有された合言葉をもう一度お確かめください。');
          setSubmitting(false);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '認証に失敗しました。';
      setErrorMessage(errorMsg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="flex items-center gap-3 text-emerald-400 mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-semibold text-lg">セキュリティ確認中...</span>
        </div>
        <p className="text-xs text-slate-400">家族認証状態を確認しています</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {/* App Title Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-inner">
            {isFirstTimeSetup ? (
              <Sparkles className="w-7 h-7 text-emerald-400" />
            ) : (
              <Lock className="w-7 h-7 text-emerald-400" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            {isFirstTimeSetup ? '家族の合言葉を設定' : '家族の合言葉を入力'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            {isFirstTimeSetup
              ? '大切な成長記録を保護し、息子さんと安全に共有するための合言葉を決めます（ひらがな・英数字など自由）。'
              : 'ご家族（お父様・息子さん）で共有している合言葉を入力してください。一度入力するとこの端末に記憶されます。'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Hint if available in verification mode */}
        {!isFirstTimeSetup && config?.hint && (
          <div className="mb-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>合言葉のヒント: <strong>{config.hint}</strong></span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              合言葉 {isFirstTimeSetup && <span className="text-emerald-400">*必須</span>}
            </label>
            <input
              type="text"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder={isFirstTimeSetup ? '例: サッカー2025 / sagas' : '合言葉を入力'}
              autoFocus
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
            {isFirstTimeSetup && (
              <p className="text-[11px] text-slate-400 mt-1">
                ※息子さんにも同じ言葉を伝えるか、後ほど1クリック共有リンクをLINEで送れます。
              </p>
            )}
          </div>

          {isFirstTimeSetup && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                思い出すためのヒント（任意）
              </label>
              <input
                type="text"
                value={hintInput}
                onChange={(e) => setHintInput(e.target.value)}
                placeholder="例: 我が家の好きなチーム名"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>認証中...</span>
              </>
            ) : isFirstTimeSetup ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>この合言葉で開始する ⚽</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>記録を見る ⚽</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            部外者からの不正アクセスを遮断し、ご家族専用の安全な環境でデータを同期・管理します。
          </p>
        </div>
      </div>
    </div>
  );
}

