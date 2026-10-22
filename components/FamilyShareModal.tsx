'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { clearStoredPasskey } from '@/lib/auth-store';

interface FamilyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPasskey: string;
  onDisconnect: () => void;
}

export default function FamilyShareModal({
  isOpen,
  onClose,
  currentPasskey,
  onDisconnect,
}: FamilyShareModalProps) {
  const [showPasskey, setShowPasskey] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedWord, setCopiedWord] = useState<boolean>(false);

  if (!isOpen) return null;

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    return `${origin}/?pass=${encodeURIComponent(currentPasskey)}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      prompt('以下の共有URLをコピーしてください:', getShareUrl());
    }
  };

  const handleCopyWord = async () => {
    try {
      await navigator.clipboard.writeText(currentPasskey);
      setCopiedWord(true);
      setTimeout(() => setCopiedWord(false), 2000);
    } catch {
      prompt('合言葉をコピーしてください:', currentPasskey);
    }
  };

  const handleLogout = () => {
    if (confirm('この端末の合言葉の記憶を解除（ログアウト）しますか？\n※次回開く際に合言葉の入力が必要になります。')) {
      clearStoredPasskey();
      onDisconnect();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">家族共有＆合言葉の設定</h3>
            <p className="text-xs text-slate-400">息子さんの端末と安全にデータを同期</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current Passkey Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400">設定されている合言葉</span>
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {showPasskey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasskey ? '隠す' : '表示'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-base font-bold font-mono tracking-wider text-slate-100 truncate">
                {showPasskey ? currentPasskey : '••••••••••••'}
              </div>
              <button
                type="button"
                onClick={handleCopyWord}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                title="合言葉をコピー"
              >
                {copiedWord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWord ? 'コピー済' : 'コピー'}</span>
              </button>
            </div>
          </div>

          {/* 1-Click Share for Son */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>息子さん用のかんたん共有リンク</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              このリンクをLINEなどで送ると、息子さんはタップするだけで<strong>合言葉を入力せずに自動で同期</strong>されます（一度開けば端末に記憶されます）。
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>共有URLをコピーしました！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>LINE送信用リンクをコピー 📱</span>
                </>
              )}
            </button>
          </div>

          {/* Security Status Info */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              合言葉でデータ領域が暗号化・隔離されています。合言葉を知らない第三者や自動巡回ロボットはデータに一切アクセスできません。
            </span>
          </div>

          {/* Disconnect button */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>この端末からログアウト</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

