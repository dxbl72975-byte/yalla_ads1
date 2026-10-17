import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Filter,
  Search,
  Sparkles,
  Clock,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  sypAmount?: number;
  isPositive: boolean;
  date?: string;
  refCode?: string;
  category?: 'topup' | 'campaign' | 'fee';
  badgeBg?: string;
  initials?: string;
}

interface TransactionHistoryFeedProps {
  transactions: WalletTransaction[];
  exchangeRate: number;
  onShowToast: (msg: string) => void;
  onLaunchNewCampaign?: () => void;
}

export const TransactionHistoryFeed: React.FC<TransactionHistoryFeedProps> = ({
  transactions,
  exchangeRate,
  onShowToast,
  onLaunchNewCampaign,
}) => {
  const [filter, setFilter] = useState<'all' | 'topup' | 'campaign'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = transactions.filter((t) => {
    if (filter === 'topup') return t.isPositive;
    if (filter === 'campaign') return !t.isPositive;
    return true;
  });

  const handleCopyRef = (ref: string, id: string) => {
    triggerHaptic('success');
    navigator.clipboard?.writeText(ref);
    setCopiedId(id);
    onShowToast(`تم نسخ رقم العملية: #${ref}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fmtAr = (n: number) => Math.round(n).toLocaleString('ar-EG');

  return (
    <div className="bg-white rounded-[26px] p-4 border border-black/8 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] grid place-items-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#0D1B12]">سجل الحركات المالية</h4>
            <span className="text-[10px] text-[#5B6E61] block">
              إيداعات شام كاش وخصومات تمويل الإعلانات
            </span>
          </div>
        </div>

        <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#15803D]/20">
          {transactions.length} حركات
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F1F4F1] rounded-2xl">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'topup', label: 'إيداعات شام كاش' },
          { id: 'campaign', label: 'تمويل الحملات' },
        ].map((tab) => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFilter(tab.id as any);
              }}
              className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-extrabold transition cursor-pointer text-center ${
                isSelected
                  ? 'bg-white text-[#0D1B12] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transaction List Feed */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar pr-0.5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs">
            <CreditCard className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
            <p className="font-bold">لا توجد حركات مالية مطابقة</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isCopying = copiedId === tx.id;
            const refNumber = tx.refCode || tx.id.replace('tx-', '').slice(-8);

            return (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-[#F8FAF8] hover:bg-[#F0F5F1] border border-black/5 flex items-center justify-between gap-2 transition group"
              >
                {/* Left side: Icon + Titles */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl grid place-items-center shrink-0 text-xs font-black shadow-2xs ${
                      tx.isPositive
                        ? 'bg-[#DCFCE7] text-[#15803D] border border-[#22C55E]/30'
                        : 'bg-[#FEE2E2] text-[#B91C1C] border border-[#EF4444]/20'
                    }`}
                  >
                    {tx.isPositive ? (
                      <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <b className="text-xs font-extrabold text-[#0D1B12] block truncate">
                        {tx.title}
                      </b>
                      {tx.isPositive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#15803D]/10 text-[#15803D]">
                          شام كاش
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#5B6E61]">
                      <span className="truncate">{tx.subtitle}</span>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleCopyRef(refNumber, tx.id)}
                        className="font-mono text-gray-600 hover:text-black flex items-center gap-0.5 cursor-pointer"
                        title="نسخ رقم العملية"
                      >
                        <span>#{refNumber}</span>
                        {isCopying ? (
                          <Check className="w-2.5 h-2.5 text-[#15803D]" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and SYP */}
                <div className="text-left shrink-0">
                  <div
                    dir="ltr"
                    className={`text-xs font-black tabular-nums ${
                      tx.isPositive ? 'text-[#15803D]' : 'text-[#0D1B12]'
                    }`}
                  >
                    {tx.isPositive ? '+' : '-'}${tx.amount.toFixed(2)}
                  </div>
                  <span className="text-[9px] text-[#5B6E61] font-mono block">
                    {fmtAr(
                      tx.sypAmount || Math.round(tx.amount * exchangeRate)
                    )}{' '}
                    ل.س
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Trust & Instant Settlement Notice */}
      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#5B6E61]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
          <span>تغذية فورية لبطاقة بوتيم الدولية عبر شام كاش</span>
        </div>
        <span className="font-mono font-bold text-[#15803D]">معتمد 100%</span>
      </div>
    </div>
  );
};
