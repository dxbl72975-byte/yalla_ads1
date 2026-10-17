import React, { useEffect, useRef } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, ArrowRight, BarChart3, Users, Globe, ExternalLink } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CampaignCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReports: () => void;
  campaignTitle: string;
  totalBudget: number;
  botimAllocated: number;
  estDailyReach: number;
  targetLocations: string[];
}

export const CampaignCelebrationModal: React.FC<CampaignCelebrationModalProps> = ({
  isOpen,
  onClose,
  onViewReports,
  campaignTitle,
  totalBudget,
  botimAllocated,
  estDailyReach,
  targetLocations,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Run Golden Particle Burst on canvas
  useEffect(() => {
    if (!isOpen) return;
    triggerHaptic('success');

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      rotation: number;
      vRot: number;
      shape: 'circle' | 'rect' | 'star';
    }

    const colors = ['#D4AF37', '#F59E0B', '#6EE787', '#34D399', '#FDE047', '#FFFFFF'];
    const particles: Particle[] = [];

    // Emit 130 particles from center
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.38;

    for (let i = 0; i < 130; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.6 ? 'star' : Math.random() > 0.3 ? 'rect' : 'circle',
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.vx *= 0.985;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 'star') {
          // simple 4-point gold star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.3, -p.size * 0.3);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(p.size * 0.3, p.size * 0.3);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.3, p.size * 0.3);
          ctx.lineTo(-p.size, 0);
          ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Main 3D Styled Modal Card */}
      <div className="relative z-20 w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#0D2A1C] via-[#071910] to-[#040E0A] border border-[#D4AF37]/40 p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(212,175,55,0.2)] text-white space-y-4">
        {/* Animated Golden & Emerald Crown Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/20 animate-ping" />
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#6EE787] animate-spin [animation-duration:9s]" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#6EE787] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30 text-[#071910]">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
        </div>

        {/* Headlines */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            تم الإطلاق وتخصيص بطاقة بوتيم بنجاح
          </span>
          <h3 className="text-xl font-black text-white pt-1">
            حملتك الإعلانية جاهزة للبث ✦
          </h3>
          <p className="text-xs text-[#86EFAC] font-bold line-clamp-1">
            «{campaignTitle}»
          </p>
        </div>

        {/* Campaign Financial & Audience Highlights */}
        <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-2xl p-3 border border-white/10 text-right text-xs">
          <div>
            <span className="text-white/60 block text-[10px]">ميزانية ميتا المحجوزة:</span>
            <b className="text-[#6EE787] text-base font-black tabular-nums" dir="ltr">
              ${botimAllocated.toFixed(2)}
            </b>
          </div>
          <div>
            <span className="text-white/60 block text-[10px]">الوصول اليومي المتوقع:</span>
            <b className="text-white text-base font-black tabular-nums">
              {Math.round(estDailyReach).toLocaleString('ar-EG')} مشاهد
            </b>
          </div>
          <div className="col-span-2 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
            <span className="text-white/60">نطاق الاستهداف:</span>
            <span className="font-bold text-[#D4AF37] truncate max-w-[190px]">
              {targetLocations.slice(0, 3).join('، ')}
            </span>
          </div>
        </div>

        {/* Live Team Guarantee Banner */}
        <div className="rounded-xl bg-[#092214] border border-[#6EE787]/30 p-2.5 flex items-center gap-2.5 text-right">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#78350F] to-[#D4AF37] flex items-center justify-center font-bold text-black text-sm shrink-0 shadow-md">
            س
          </div>
          <div className="text-[10px] leading-snug">
            <b className="text-[#D4AF37] block font-extrabold">سارة وفريق الحملات:</b>
            <span className="text-white/80">
              بدأنا الآن مراجعة الجمهور وربط الإعلان مع منصات ميتا (فيسبوك وإنستغرام) لضمان أعلى عائد.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onViewReports();
            }}
            className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] text-[#071910] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>عرض تقرير الأداء المباشر للحملة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white/90 text-xs font-bold transition cursor-pointer"
          >
            العودة للوحة التحكم الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};
