import React from 'react';
import { Home, PlusCircle, Wallet, User, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export type NavTabId = 'home' | 'campaign' | 'wallet' | 'support';

interface BottomNavigationBarProps {
  activeScreen: string;
  onNavigate: (tab: NavTabId) => void;
  unreadSupportCount?: number;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeScreen,
  onNavigate,
  unreadSupportCount = 0,
}) => {
  // Map any internal screen to one of the 4 primary tabs
  const getActiveTab = (): NavTabId => {
    if (activeScreen === 'wallet') return 'wallet';
    if (activeScreen === 'support') return 'support';
    if (activeScreen === 'campaign' || activeScreen === 'targeting' || activeScreen === 'budget') {
      return 'campaign';
    }
    return 'home';
  };

  const activeTab = getActiveTab();

  const tabs: {
    id: NavTabId;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'campaign', label: 'حملة جديدة', icon: PlusCircle, badge: '✦' },
    { id: 'wallet', label: 'المحفظة', icon: Wallet },
    { id: 'support', label: 'حسابي', icon: User },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className="bg-[#0A1F16]/95 backdrop-blur-xl border-t border-[#6EE787]/20 p-2 px-3 rounded-b-[40px] shrink-0 relative select-none shadow-[0_-10px_25px_rgba(0,0,0,0.35)]">
      {/* Sliding Glowing Capsule Indicator */}
      <div className="relative w-full h-[52px]">
        {/* Animated Sliding Pill Background */}
        <div
          className="absolute top-0 bottom-0 p-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
          style={{
            right: `${(activeIndex >= 0 ? activeIndex : 0) * 25}%`,
            width: '25%',
          }}
        >
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#184E33] to-[#0D2E1E] border border-[#6EE787]/50 shadow-[0_4px_18px_rgba(110,231,135,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] relative overflow-hidden">
            {/* Top Glowing Beam inside pill */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#6EE787] to-transparent" />
            <div className="absolute inset-0 bg-radial from-[#6EE787]/15 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* 4 Interactive Tab Buttons */}
        <div className="relative z-10 grid grid-cols-4 h-full">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onNavigate(tab.id);
                }}
                className="flex flex-col items-center justify-center h-full relative cursor-pointer active:scale-95 transition-transform"
                aria-label={tab.label}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? 'text-[#6EE787] nav-icon-bounce drop-shadow-[0_0_8px_rgba(110,231,135,0.7)]'
                        : 'text-white/60 hover:text-white/90'
                    }`}
                  />

                  {/* Badge or Sparkle */}
                  {tab.id === 'campaign' && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                  )}

                  {tab.id === 'support' && unreadSupportCount > 0 && (
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] border border-[#0A1F16]" />
                  )}
                </div>

                <span
                  className={`text-[10px] font-extrabold mt-0.5 transition-colors duration-200 ${
                    isActive
                      ? 'text-white drop-shadow-sm font-black'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Sub-dot under active tab */}
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#6EE787] shadow-[0_0_6px_#6EE787]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
