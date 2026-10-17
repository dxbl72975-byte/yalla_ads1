import React from 'react';
import { SPLASH_LOGO_DATA_URI } from '../assets/splashLogo';

interface YallaLogoAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customAvatar?: string | null;
  onClick?: () => void;
  className?: string;
}

/**
 * Renders the official "يلا إعلان — YALLA ADS" silver-white 3D Arabic calligraphy emblem
 * on the deep forest emerald geometric background (matching the user's brand image),
 * used as the avatar next to "محمد مشارقة" and across internal screens.
 */
export const YallaLogoAvatar: React.FC<YallaLogoAvatarProps> = ({
  size = 'md',
  customAvatar,
  onClick,
  className = '',
}) => {
  const dimensions = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title="محمد مشارقة — يلا إعلان"
      className={`${dimensions} rounded-full p-[2px] bg-gradient-to-br from-[#86EFAC] via-[#4ADE80] to-[#15803D] shadow-[0_4px_14px_rgba(110,231,135,0.3)] shrink-0 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
      } ${className}`}
    >
      <div className="w-full h-full rounded-full bg-[#062415] relative overflow-hidden flex flex-col items-center justify-center">
        {/* زخرفة إسلامية هندسية خفيفة في الخلفية الزمردية */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        >
          <g fill="none" stroke="#6EE787" strokeWidth="1.2">
            <path d="M50 5 L95 50 L50 95 L5 50 Z" />
            <path d="M50 20 L80 50 L50 80 L20 50 Z" />
            <circle cx="50" cy="50" r="14" />
          </g>
        </svg>

        {customAvatar ? (
          <img
            src={customAvatar}
            alt="محمد مشارقة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover relative z-10"
          />
        ) : (
          /* مخطوطة "يلا إعلان — YALLA ADS" الفضية البيضاء ثلاثية الأبعاد المطابقة للصورة المرفقة */
          <svg
            viewBox="0 0 120 120"
            className="w-[88%] h-[88%] relative z-10 drop-shadow-[0_3px_5px_rgba(0,0,0,0.65)]"
            aria-label="يلا إعلان YALLA ADS"
          >
            <defs>
              <linearGradient id="silverRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#E6ECE8" />
                <stop offset="100%" stopColor="#BAC7BF" />
              </linearGradient>
              <linearGradient id="silverShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94A89B" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>

            {/* الجزء العلوي: مخطوطة "يلا" المتداخلة */}
            <path
              d="M36 42 C41 25, 59 25, 63 42 C65 50, 56 56, 44 59 C54 53, 58 46, 55 39 C52 33, 42 33, 36 42 Z"
              fill="url(#silverRibbon)"
            />
            <path
              d="M66 23 L66 47 C66 53, 73 54, 78 48 C81 44, 80 39, 77 36 L75 41 C76 44, 73 47, 71 45 L70 20 Z"
              fill="url(#silverRibbon)"
            />
            {/* نقطتا الياء المربعتان المائلتان */}
            <rect
              x="68"
              y="54"
              width="4.5"
              height="4.5"
              transform="rotate(45 70.25 56.25)"
              fill="#FFFFFF"
            />
            <rect
              x="75"
              y="54"
              width="4.5"
              height="4.5"
              transform="rotate(45 77.25 56.25)"
              fill="#FFFFFF"
            />

            {/* الجزء الأوسط والسفلي: مخطوطة "إعلان" الانسيابية */}
            {/* حرف الألف والهمزة السفلية */}
            <path
              d="M92 50 C88 57, 88 73, 91 81 L94 75 C93 67, 93 57, 95 48 Z"
              fill="url(#silverRibbon)"
            />
            {/* حرف العين واللام المتصل */}
            <path
              d="M82 61 C76 58, 69 61, 68 66 C67 71, 74 73, 86 68 L84 74 C72 79, 64 81, 60 72 L59 56 L54 62 L56 76 C54 83, 46 87, 39 87 C48 84, 51 78, 49 71 L43 69 C46 77, 41 82, 33 81 C26 80, 25 71, 32 64 C37 59, 46 56, 54 53 C42 56, 23 63, 23 76 C23 86, 35 89, 45 84"
              fill="url(#silverRibbon)"
            />
            {/* نقطة النون */}
            <rect
              x="36"
              y="66"
              width="5"
              height="5"
              transform="rotate(45 38.5 68.5)"
              fill="#FFFFFF"
            />
            {/* الشريط السفلي الممتد تحت كلمة إعلان */}
            <path
              d="M40 89 C54 92, 72 85, 86 78 L84 84 C68 91, 51 96, 38 90 Z"
              fill="url(#silverShadow)"
            />
            {/* كسرة الهمزة تحت الألف */}
            <path d="M87 84 L95 80 L93 84 L85 88 Z" fill="#FFFFFF" />
            <path d="M85 89 L93 85 L91 89 L83 93 Z" fill="#D5E0D9" />

            {/* نص YALLA ADS أسفل الشعار */}
            <text
              x="60"
              y="105"
              fill="#FFFFFF"
              fontSize="7.2"
              fontWeight="700"
              letterSpacing="2.2"
              textAnchor="middle"
              fontFamily="Georgia, serif"
            >
              YALLA ADS
            </text>
          </svg>
        )}
      </div>
    </div>
  );
};

export const YallaBrandCardArtwork: React.FC = () => (
  <div className="w-16 h-16 rounded-2xl bg-[#062415] border border-[#4ADE80]/40 shadow-md grid place-items-center shrink-0 relative overflow-hidden">
    <img
      src={SPLASH_LOGO_DATA_URI}
      alt="يلا إعلان"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover opacity-30 absolute inset-0"
    />
    <YallaLogoAvatar size="md" />
  </div>
);
