import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Zap,
  Lock,
  Unlock,
  Rotate3d,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface Vault3DCardProps {
  balance: number;
  exchangeRate: number;
  userName: string;
  onQuickTopup?: (amount: number) => void;
  onShowToast: (msg: string) => void;
}

export const Vault3DCard: React.FC<Vault3DCardProps> = ({
  balance,
  exchangeRate,
  userName,
  onQuickTopup,
  onShowToast,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showFullNumber, setShowFullNumber] = useState<boolean>(false);
  const [isCardLocked, setIsCardLocked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [displayCurrency, setDisplayCurrency] = useState<'usd' | 'syp'>('usd');

  const [isHovered, setIsHovered] = useState<boolean>(false);

  // 3D Tilt State
  const [tilt, setTilt] = useState<{ x: number; y: number; glareX: number; glareY: number }>({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50,
  });

  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (!isHovered) setIsHovered(true);
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // tilt up/down
    const rotateY = ((x - centerX) / centerX) * 14; // tilt left/right

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const handleCopyCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    navigator.clipboard?.writeText('4532 8901 6742 8492');
    setCopied(true);
    onShowToast('تم نسخ رقم بطاقة بوتيم الدولية');
    setTimeout(() => setCopied(false), 2000);
  };

  const monthlyLimit = 1000;
  const progressRatio = Math.min(100, (balance / monthlyLimit) * 100);

  return (
    <div className="space-y-3">
      {/* 3D Perspective Card Container with Hover Golden Glow */}
      <div
        className="perspective-card cursor-pointer select-none relative group"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          triggerHaptic('medium');
          setIsFlipped(!isFlipped);
        }}
      >
        {/* Soft Golden Ambient Aura Behind Card on Hover */}
        <div
          className="absolute -inset-2.5 rounded-[34px] transition-all duration-500 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(212, 175, 55, 0.55) 0%, rgba(245, 158, 11, 0.3) 45%, rgba(110, 231, 135, 0.18) 70%, transparent 80%)',
            filter: isHovered ? 'blur(26px)' : 'blur(12px)',
            opacity: isHovered ? 0.95 : 0.22,
            transform: `translate(${tilt.y * 1.3}px, ${-tilt.x * 1.3}px) scale(${isHovered ? 1.05 : 0.98})`,
          }}
        />

        <div
          ref={cardRef}
          className="relative w-full h-54 rounded-[26px] card-3d-inner transition-transform duration-150"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg) scale(${
              isHovered ? 1.015 : 1
            })`,
          }}
        >
          {/* ---------------- FRONT FACE (YALLA ADS METALLIC CARD) ---------------- */}
          <div
            className={`absolute inset-0 rounded-[26px] p-5 text-white flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
              isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            style={{
              background:
                'linear-gradient(135deg, #051A11 0%, #0D2E20 28%, #164630 50%, #0D2E20 74%, #04140D 100%)',
              backfaceVisibility: 'hidden',
              boxShadow: isHovered
                ? '0 25px 65px rgba(0, 0, 0, 0.85), 0 0 50px rgba(212, 175, 55, 0.5), 0 0 95px rgba(110, 231, 135, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
                : '0 15px 35px rgba(0, 0, 0, 0.65), 0 0 22px rgba(212, 175, 55, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              border: isHovered
                ? '1.5px solid rgba(253, 224, 71, 0.95)'
                : '1px solid rgba(212, 175, 55, 0.6)',
            }}
          >
            {/* Damascus Geometric Metallic Vector Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="damascusPattern" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path
                    d="M16 0 L32 16 L16 32 L0 16 Z M16 4 L28 16 L16 28 L4 16 Z"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="0.8"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#damascusPattern)" />
            </svg>

            {/* Specular Shimmering Light-Sweep Beam (شريط لمعة متحرك فخم) */}
            <div className="metallic-light-sweep-beam" />

            {/* Moving Holographic Tilt Glare */}
            <div
              className="card-holo-glare absolute inset-0 rounded-[26px]"
              style={{
                backgroundPosition: `${tilt.glareX}% ${tilt.glareY}%`,
              }}
            />

            {/* Top Row: Yalla Ads Brand & Currency Switcher */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] via-[#FDE047] to-[#B45309] flex items-center justify-center font-black text-[#071910] text-xs shadow-md border border-[#FDE047]/60">
                  يلا
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <b className="text-sm font-black text-white tracking-wider drop-shadow-sm">
                      YALLA ADS
                    </b>
                    <span className="text-[9px] bg-gradient-to-r from-[#D4AF37]/25 to-[#FDE047]/20 border border-[#D4AF37]/50 text-[#FDE047] px-2 py-0.5 rounded-full font-extrabold tracking-wide">
                      VIRTUAL
                    </span>
                  </div>
                  <small className="text-[10px] text-[#86EFAC] block font-bold leading-tight">
                    بطاقة ميتا الافتراضية المعتمدة · بوتيم & شام كاش
                  </small>
                </div>
              </div>

              {/* Currency Toggle (USD ⇄ SYP) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  setDisplayCurrency(displayCurrency === 'usd' ? 'syp' : 'usd');
                }}
                className="bg-black/60 backdrop-blur-md border border-[#D4AF37]/50 text-[#FDE047] text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-black/80 transition cursor-pointer shadow-sm active:scale-95"
                title="تبديل العملة المعروضة"
              >
                <span>{displayCurrency === 'usd' ? 'USD $' : 'ل.س SYP'}</span>
                <Rotate3d className="w-3 h-3 text-[#6EE787]" />
              </button>
            </div>

            {/* Middle: EMV Chip & Contactless Wave & Live Balance */}
            <div className="relative z-10 flex items-center justify-between my-auto pt-1">
              <div className="flex items-center gap-3">
                {/* Golden EMV Chip */}
                <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-[#D4AF37] via-[#FDE047] to-[#B45309] p-0.5 shadow-md flex flex-col justify-between border border-[#FDE047]/40">
                  <div className="flex justify-between h-2 border-b border-[#78350F]/40" />
                  <div className="w-3 h-2 rounded-sm bg-[#78350F]/30 mx-auto" />
                  <div className="flex justify-between h-2 border-t border-[#78350F]/40" />
                </div>
                {/* Contactless Wi-Fi Waves */}
                <svg className="w-5 h-5 text-[#D4AF37] drop-shadow-sm rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                </svg>
              </div>

              {/* Dynamic Balance Display */}
              <div className="text-left">
                <span className="text-[10px] text-white/70 block font-bold">
                  {displayCurrency === 'usd' ? 'إجمالي الرصيد القابل للتمويل' : 'المعادل بالليرة السورية'}
                </span>
                <b className="text-2xl font-black text-[#6EE787] tabular-nums tracking-tight drop-shadow-md" dir="ltr">
                  {displayCurrency === 'usd'
                    ? `$ ${balance.toFixed(2)}`
                    : `${Math.round(balance * exchangeRate).toLocaleString('ar-EG')} ل.س`}
                </b>
              </div>
            </div>

            {/* Bottom Row: Card Number & Cardholder & Action */}
            <div className="relative z-10 flex items-end justify-between pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs tracking-widest text-[#F5F5F7] font-bold" dir="ltr">
                    {showFullNumber ? '4532 8901 6742 8492' : '•••• •••• •••• 8492'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setShowFullNumber(!showFullNumber);
                    }}
                    className="text-white/60 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCard}
                    className="text-white/60 hover:text-[#6EE787] p-0.5 cursor-pointer"
                    title="نسخ رقم البطاقة"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#6EE787]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] font-black text-[#D4AF37] pt-0.5 truncate max-w-[170px]">
                  {userName}
                </div>
              </div>

              <div className="text-left">
                <span className="text-[9px] text-white/50 block font-mono">EXP / CVV</span>
                <span className="text-xs font-mono font-bold text-white/90" dir="ltr">
                  08/29 · {showFullNumber ? '749' : '•••'}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- BACK FACE (VIRTUAL CARD REVERSE) ---------------- */}
          <div
            className={`absolute inset-0 rounded-[26px] p-5 text-white flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
              isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              background: 'linear-gradient(135deg, #05140D 0%, #0A2619 60%, #04100A 100%)',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              boxShadow: isHovered
                ? '0 25px 65px rgba(0, 0, 0, 0.8), 0 0 45px rgba(212, 175, 55, 0.45), 0 0 90px rgba(212, 175, 55, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.4)'
                : '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.15)',
              border: isHovered
                ? '1px solid rgba(253, 224, 71, 0.9)'
                : '1px solid rgba(212, 175, 55, 0.5)',
            }}
          >
            {/* Specular Shimmering Light-Sweep Beam on Back */}
            <div className="metallic-light-sweep-beam opacity-40" />

            {/* Magnetic Stripe */}
            <div className="relative z-10 w-full h-8 bg-black/95 -mx-5 mt-1 border-y border-white/15" />

            {/* Signature & CVV Panel */}
            <div className="relative z-10 space-y-1 my-auto">
              <div className="flex items-center justify-between text-[10px] text-white/70">
                <span>توقيع العميل المعتمد (Authorized Signature)</span>
                <span className="font-mono">CVV 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 flex-1 bg-white/95 rounded text-black font-serif italic text-xs px-3 flex items-center font-bold tracking-wide">
                  {userName}
                </div>
                <div className="h-7 w-12 bg-white text-black font-mono font-black text-xs grid place-items-center rounded border border-black/20">
                  749
                </div>
              </div>
              <p className="text-[9.5px] text-white/70 leading-tight pt-1">
                بطاقة «يلا إعلان — Yalla Ads» الافتراضية المعتمدة لتمويل إعلانات ميتا (فيسبوك وإنستغرام) عبر شبكة بوتيم العالمية ومربوطة مباشرة برصيدك في شام كاش بسوريا.
              </p>
            </div>

            {/* Security Indicator */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-[#86EFAC] border-t border-white/10 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6EE787]" />
                <span className="font-bold">حماية مشفرة 256-bit TLS</span>
              </span>
              <span className="text-[#FDE047] font-bold font-mono">انقر لقلب البطاقة ↻</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Spending Progress Bar */}
      <div className="bg-[#092214]/90 border border-[#6EE787]/25 rounded-2xl p-3 text-white space-y-2 shadow-md">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-white/80">
            <TrendingUp className="w-3.5 h-3.5 text-[#6EE787]" />
            <span>حد الإنفاق الإعلاني الشهري:</span>
          </span>
          <span className="text-[#6EE787] font-black tabular-nums" dir="ltr">
            ${balance.toFixed(0)} / ${monthlyLimit}
          </span>
        </div>

        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4ADE80] via-[#6EE787] to-[#D4AF37] rounded-full transition-all duration-500 shadow-[0_0_10px_#6EE787]"
            style={{ width: `${progressRatio}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/60 pt-0.5">
          <span>شحن فوري بالليرة السورية ⇄ تمويل بالدولار لميتا</span>
          <span className="text-[#D4AF37] font-bold">
            متاح {Math.round(100 - progressRatio)}% إضافي
          </span>
        </div>
      </div>

      {/* Quick Top-Up Pills (Instant Sham Cash Shifting) */}
      {onQuickTopup && (
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          {[20, 50, 100, 200].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onQuickTopup(amt);
              }}
              className="flex-1 py-1.5 rounded-xl bg-[#092214] hover:bg-[#113824] border border-[#6EE787]/30 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Zap className="w-3 h-3 text-[#D4AF37]" />
              <span>+${amt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
