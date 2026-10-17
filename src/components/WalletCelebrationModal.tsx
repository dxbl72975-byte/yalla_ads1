import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export interface WalletCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCampaign: () => void;
  amountUsd: number;
  newBalance: number;
  referenceNumber: string;
  exchangeRate?: number;
  methodName?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  accentColor: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  flipAngle: number;
  vFlip: number;
  swayFreq: number;
  swayAmp: number;
  swayPhase: number;
  type: 'coin' | 'star' | 'flake' | 'dust';
}

export const WalletCelebrationModal: React.FC<WalletCelebrationModalProps> = ({
  isOpen,
  onClose,
  onGoToCampaign,
  amountUsd,
  newBalance,
  referenceNumber,
  exchangeRate = 14500,
  methodName = 'شام كاش',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Copy reference code to clipboard
  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(referenceNumber);
      triggerHaptic('light');
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2200);
    } catch {
      // fallback
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2200);
    }
  };

  // Falling Golden Particles Shower Effect
  useEffect(() => {
    if (!isOpen) return;

    triggerHaptic('success');

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const goldColors = [
      { main: '#F59E0B', accent: '#FEF08A' },
      { main: '#D4AF37', accent: '#FFFBEB' },
      { main: '#EAB308', accent: '#FDE047' },
      { main: '#FCD34D', accent: '#B45309' },
      { main: '#6EE787', accent: '#DCFCE7' }, // subtle Yalla emerald accent
    ];

    const particles: Particle[] = [];
    const startTime = performance.now();
    const spawnDuration = 3800; // Continuous waterfall of gold for 3.8s

    // Helper to spawn one particle
    const createParticle = (fromTopOnly = false): Particle => {
      const palette = goldColors[Math.floor(Math.random() * goldColors.length)];
      const randType = Math.random();
      let type: Particle['type'] = 'dust';
      let size = 4;

      if (randType > 0.65) {
        type = 'coin';
        size = Math.random() * 8 + 12; // 12-20px gold coins
      } else if (randType > 0.4) {
        type = 'star';
        size = Math.random() * 6 + 8; // 8-14px sparkling stars
      } else if (randType > 0.2) {
        type = 'flake';
        size = Math.random() * 7 + 8; // 8-15px golden foil flakes
      } else {
        type = 'dust';
        size = Math.random() * 4 + 2.5; // shimmering golden dust
      }

      return {
        type,
        x: Math.random() * width,
        y: fromTopOnly ? -25 - Math.random() * 40 : Math.random() * height * 0.45 - 30,
        vx: (Math.random() - 0.5) * 2.2,
        vy: Math.random() * 2.5 + 2.2, // falling speed
        size,
        color: palette.main,
        accentColor: palette.accent,
        alpha: Math.random() * 0.25 + 0.75,
        decay: Math.random() * 0.002 + 0.001,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        flipAngle: Math.random() * Math.PI * 2,
        vFlip: (Math.random() - 0.5) * 0.12, // 3D tumble
        swayFreq: Math.random() * 0.03 + 0.015,
        swayAmp: Math.random() * 1.6 + 0.8,
        swayPhase: Math.random() * Math.PI * 2,
      };
    };

    // Initial burst of falling golden particles
    for (let i = 0; i < 75; i++) {
      particles.push(createParticle(false));
    }

    let frameCount = 0;

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      // Continuously spawn golden particles cascading from top
      if (elapsed < spawnDuration) {
        const spawnCount = Math.random() > 0.3 ? 3 : 2;
        for (let i = 0; i < spawnCount; i++) {
          particles.push(createParticle(true));
        }
      }

      frameCount++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics updates
        p.vy += 0.045; // gentle gravity
        p.y += p.vy;
        p.x += p.vx + Math.sin(frameCount * p.swayFreq + p.swayPhase) * p.swayAmp;
        p.rotation += p.vRot;
        p.flipAngle += p.vFlip;

        // Fade out as it falls past bottom
        if (p.y > height - 100) {
          p.alpha -= 0.025;
        } else {
          p.alpha -= p.decay;
        }

        if (p.alpha <= 0 || p.y > height + 60) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'coin') {
          // 3D Flipping Gold Coin
          const flipScale = Math.cos(p.flipAngle);
          ctx.scale(1, Math.abs(flipScale) > 0.08 ? flipScale : 0.08);

          // Outer Coin Glow & Shadow
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 10;

          // Coin Rim
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Inner Coin Inset
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.78, 0, Math.PI * 2);
          ctx.fillStyle = p.accentColor;
          ctx.fill();

          // Embossed Center Star / Coin Sign
          ctx.fillStyle = p.color;
          ctx.font = `bold ${Math.round(p.size * 0.8)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);
        } else if (p.type === 'star') {
          // 4-Point Sparkling Star
          ctx.shadowColor = '#FDE047';
          ctx.shadowBlur = 12;
          ctx.fillStyle = p.accentColor;

          ctx.beginPath();
          const spikes = 4;
          const outerRadius = p.size;
          const innerRadius = p.size * 0.28;
          let rot = (Math.PI / 2) * 3;
          let x = 0;
          let y = 0;
          const step = Math.PI / spikes;

          ctx.moveTo(0, -outerRadius);
          for (let s = 0; s < spikes; s++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(0, -outerRadius);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'flake') {
          // Metallic Gold Confetti / Flake with 3D tumble
          const flipScale = Math.sin(p.flipAngle);
          ctx.scale(1, flipScale);
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 6;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);

          // Golden sheen line across flake
          ctx.fillStyle = p.accentColor;
          ctx.fillRect(-p.size / 2, -p.size * 0.1, p.size, p.size * 0.2);
        } else {
          // Golden Dust / Glowing Orb
          ctx.shadowColor = '#FEF08A';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.accentColor;
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0 || elapsed < spawnDuration) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sypFormatted = (amountUsd * exchangeRate).toLocaleString();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تأكيد شحن المحفظة بنجاح"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto animate-in fade-in duration-300 backdrop-blur-md bg-black/75"
      dir="rtl"
    >
      {/* Canvas for Falling Golden Particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[51]"
      />

      {/* Main Luxury Modal Card */}
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-gradient-to-b from-[#092014] via-[#06170E] to-[#030B07] border-2 border-amber-400/50 shadow-[0_25px_80px_-15px_rgba(212,175,55,0.45),0_0_40px_rgba(110,231,135,0.25)] p-5 sm:p-7 text-white text-right z-[52] overflow-hidden">
        {/* Subtle Ambient Gold Light Sheen at top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-400/20 via-emerald-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition cursor-pointer border border-white/10"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Central Achievement Badge with Pulsing Glow */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="relative mb-3">
            {/* Golden Radiance Rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 blur-xl opacity-60 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#166534] via-[#0E3D20] to-[#D4AF37] p-1 shadow-2xl flex items-center justify-center border-2 border-amber-300">
              <div className="w-full h-full rounded-full bg-[#051C0F] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-amber-400 animate-bounce duration-1000" />
              </div>
            </div>
            {/* Sparkle badge */}
            <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-black" />
              ناجح
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-emerald-300 tracking-tight">
            تم تأكيد الشحن بنجاح!
          </h2>
          <p className="text-xs text-[#A7F3D0] mt-1 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            عملية موثوقة ومطابقة عبر {methodName}
          </p>
        </div>

        {/* Amount Box with Golden Sheen */}
        <div className="relative rounded-2xl bg-gradient-to-br from-black/60 to-black/30 border border-amber-400/30 p-4 mb-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
          <span className="text-[11px] text-amber-300/80 font-bold block mb-1">
            المبلغ المودع في بطاقة يلا إعلان
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight flex items-center justify-center gap-1.5">
            <span>+${amountUsd.toFixed(2)}</span>
            <span className="text-sm font-bold text-amber-200/80">USD</span>
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-extrabold">
            ما يعادل ≈ {sypFormatted} ل.س
          </div>
        </div>

        {/* Balance & Card Details */}
        <div className="space-y-2.5 mb-5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-2 text-white/80">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>الرصيد الكلي الجديد للمحفظة:</span>
            </div>
            <span className="font-black text-amber-300 text-sm">
              ${newBalance.toFixed(2)} USD
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-white/70">رقم الإشعار المرجعي:</span>
            <button
              type="button"
              onClick={handleCopyRef}
              className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition cursor-pointer"
            >
              {copiedRef ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>#{referenceNumber}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-[#A7F3D0]">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              رصيدك جاهز فوراً لتمويل إعلانات ميتا (فيسبوك وإنستغرام) عبر بطاقة بوتيم الدولية بدون حظر.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onGoToCampaign();
            }}
            className="w-full py-3.5 px-4 rounded-xl gold-glow-btn text-xs font-black active:scale-98 transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            <span>ابدأ إطلاق حملة جديدة الآن</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            البقاء في المحفظة ومراجعة السجل
          </button>
        </div>
      </div>
    </div>
  );
};
