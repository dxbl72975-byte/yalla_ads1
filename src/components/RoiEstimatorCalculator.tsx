import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  MousePointerClick,
  MessageCircle,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { openWhatsAppSupport } from '../utils/whatsapp';

interface RoiEstimatorCalculatorProps {
  currentDailyBudget?: number;
  currentDurationDays?: number;
  onApplyBudget?: (dailyBudget: number, durationDays: number) => void;
  compact?: boolean;
}

interface NicheConfig {
  id: string;
  name: string;
  icon: string;
  cpcAvg: number; // in USD
  ctrAvg: number; // in %
  conversionRate: number; // in %
  roasMultiplier: number;
}

const NICHES: NicheConfig[] = [
  {
    id: 'food',
    name: 'مطاعم وكافيهات',
    icon: '🍔',
    cpcAvg: 0.032,
    ctrAvg: 4.8,
    conversionRate: 8.5,
    roasMultiplier: 4.5,
  },
  {
    id: 'fashion',
    name: 'أزياء وتجارة إلكترونية',
    icon: '👗',
    cpcAvg: 0.045,
    ctrAvg: 3.9,
    conversionRate: 5.2,
    roasMultiplier: 3.8,
  },
  {
    id: 'clinic',
    name: 'عيادات وتجميل',
    icon: '🩺',
    cpcAvg: 0.055,
    ctrAvg: 3.2,
    conversionRate: 6.8,
    roasMultiplier: 5.2,
  },
  {
    id: 'services',
    name: 'خدمات وشركات',
    icon: '💼',
    cpcAvg: 0.065,
    ctrAvg: 2.8,
    conversionRate: 4.5,
    roasMultiplier: 3.4,
  },
];

export const RoiEstimatorCalculator: React.FC<RoiEstimatorCalculatorProps> = ({
  currentDailyBudget = 10,
  currentDurationDays = 7,
  onApplyBudget,
  compact = false,
}) => {
  const [daily, setDaily] = useState<number>(currentDailyBudget);
  const [days, setDays] = useState<number>(currentDurationDays);
  const [selectedNiche, setSelectedNiche] = useState<NicheConfig>(NICHES[0]);
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);

  const totalAdBudget = daily * days;
  const totalWithCommission = totalAdBudget * 1.2;

  // Real-time calculations based on Syrian Meta market metrics
  const estimatedClicks = Math.round(totalAdBudget / selectedNiche.cpcAvg);
  const minClicks = Math.round(estimatedClicks * 0.85);
  const maxClicks = Math.round(estimatedClicks * 1.25);

  const estimatedReach = Math.round(
    (totalAdBudget * 1000) / (selectedNiche.cpcAvg * selectedNiche.ctrAvg * 10)
  );
  const minReach = Math.round(estimatedReach * 0.82);
  const maxReach = Math.round(estimatedReach * 1.28);

  const estimatedInquiries = Math.round(
    (estimatedClicks * selectedNiche.conversionRate) / 100
  );
  const minInquiries = Math.max(3, Math.round(estimatedInquiries * 0.75));
  const maxInquiries = Math.round(estimatedInquiries * 1.3);

  const projectedSalesVolume = Math.round(totalAdBudget * selectedNiche.roasMultiplier);

  const fmtAr = (n: number) => Math.round(n).toLocaleString('ar-EG');

  return (
    <div className="rounded-[24px] bg-gradient-to-br from-[#0A2216] via-[#0E2F1F] to-[#081B11] text-white p-4 border border-[#6EE787]/30 shadow-lg relative overflow-hidden transition-all duration-300">
      {/* Specular Ambient Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F59E0B] text-[#071910] grid place-items-center shadow-xs">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white">حاسبة العائد والوصول (ROI)</h4>
              <span className="px-2 py-0.2 rounded-full bg-[#6EE787]/20 border border-[#6EE787]/40 text-[#6EE787] text-[9px] font-bold">
                تقديرات حية
              </span>
            </div>
            <span className="text-[10px] text-white/70 block">
              احسب عدد الزبائن والمشاهدات المتوقعة لحملتك في سوريا
            </span>
          </div>
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3.5 mt-3 relative z-10 pt-1">
          {/* Niche Selector */}
          <div>
            <label className="block text-[10px] font-bold text-white/75 mb-1.5">
              اختر قطاع نشاطك التجاري:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {NICHES.map((niche) => {
                const isSelected = selectedNiche.id === niche.id;
                return (
                  <button
                    key={niche.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedNiche(niche);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#6EE787] text-[#071910] border-[#6EE787] shadow-sm font-black'
                        : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span>{niche.icon}</span>
                    <span className="truncate">{niche.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders and Quick Presets */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-3">
            {/* Daily Budget Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                <span className="text-white/85">الميزانية اليومية الصافية لميتا:</span>
                <span className="text-[#6EE787] font-mono font-black" dir="ltr">
                  ${daily} / يوم
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                step={1}
                value={daily}
                onChange={(e) => {
                  triggerHaptic('light');
                  setDaily(Number(e.target.value));
                }}
                className="w-full accent-[#6EE787] cursor-pointer"
              />
              <div className="flex justify-between gap-1 mt-1.5">
                {[5, 10, 20, 35, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setDaily(preset);
                    }}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition cursor-pointer ${
                      daily === preset
                        ? 'bg-[#6EE787]/25 text-[#6EE787] border-[#6EE787]'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                <span className="text-white/85">مدة تشغيل الحملة:</span>
                <span className="text-[#FDE047] font-bold">{fmtAr(days)} أيام</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                value={days}
                onChange={(e) => {
                  triggerHaptic('light');
                  setDays(Number(e.target.value));
                }}
                className="w-full accent-[#FDE047] cursor-pointer"
              />
            </div>
          </div>

          {/* Results Grid Cards */}
          <div className="grid grid-cols-2 gap-2">
            {/* Expected Reach */}
            <div className="rounded-2xl bg-gradient-to-br from-[#123E27] to-[#0A2417] p-2.5 border border-[#6EE787]/30 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#6EE787] text-[10px] font-bold mb-1">
                <Target className="w-3.5 h-3.5" />
                <span>الوصول المتوقع</span>
              </div>
              <b className="text-sm font-black text-white block tabular-nums">
                {fmtAr(minReach)} — {fmtAr(maxReach)}
              </b>
              <small className="text-[9px] text-[#86EFAC] block font-semibold mt-0.5">
                مشاهد مهتم في المحافظات
              </small>
            </div>

            {/* Expected Clicks */}
            <div className="rounded-2xl bg-gradient-to-br from-[#123E27] to-[#0A2417] p-2.5 border border-[#6EE787]/30 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#38BDF8] text-[10px] font-bold mb-1">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>النقرات المتوقعة</span>
              </div>
              <b className="text-sm font-black text-white block tabular-nums">
                {fmtAr(minClicks)} — {fmtAr(maxClicks)}
              </b>
              <small className="text-[9px] text-[#7DD3FC] block font-semibold mt-0.5">
                تفاعل مباشر مع إعلانك
              </small>
            </div>

            {/* Expected WhatsApp Leads / Inquiries */}
            <div className="rounded-2xl bg-gradient-to-br from-[#123E27] to-[#0A2417] p-2.5 border border-[#D4AF37]/40 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#FDE047] text-[10px] font-bold mb-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>الطلبات / المحادثات</span>
              </div>
              <b className="text-sm font-black text-white block tabular-nums">
                ~ {fmtAr(minInquiries)} إلى {fmtAr(maxInquiries)} زبون
              </b>
              <small className="text-[9px] text-[#FEF08A] block font-semibold mt-0.5">
                رسائل شراء واستفسار فورية
              </small>
            </div>

            {/* Projected ROI Multiplier */}
            <div className="rounded-2xl bg-gradient-to-br from-[#123E27] to-[#0A2417] p-2.5 border border-[#6EE787]/30 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#4ADE80] text-[10px] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>عائد الإعلان التقديري</span>
              </div>
              <b className="text-sm font-black text-[#6EE787] block tabular-nums" dir="ltr">
                {selectedNiche.roasMultiplier}x ROAS
              </b>
              <small className="text-[9px] text-[#86EFAC] block font-semibold mt-0.5">
                مبيعات تقديرية ~ ${projectedSalesVolume}
              </small>
            </div>
          </div>

          {/* Action CTAs: Apply to Campaign & Smart WhatsApp Inquiry */}
          <div className="space-y-1.5 pt-1">
            {onApplyBudget && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('success');
                  onApplyBudget(daily, days);
                }}
                className="w-full py-2.5 px-3 rounded-full gold-glow-btn text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>اعتماد هذه الميزانية (${totalWithCommission.toFixed(0)} مع العمولة)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                openWhatsAppSupport({
                  topic: 'roi',
                  budget: totalAdBudget,
                  durationDays: days,
                  expectedReach: maxReach,
                  expectedClicks: maxClicks,
                });
              }}
              className="w-full py-2 px-3 rounded-full bg-[#128C7E]/40 hover:bg-[#128C7E]/60 border border-[#25D366]/40 text-[#86EFAC] text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>استشر خبير الحملات عبر واتساب لمراجعة العائد (+971558171946)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
