import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  BarChart2,
  Compass,
  User,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  LayoutGrid,
  Search,
  Calendar,
  ArrowLeft,
  Sparkles,
  Upload,
  Video,
  Send,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Columns3,
  Camera,
  Zap,
  TrendingUp,
  Target,
  Activity,
  MessageSquare,
  MessageCircle,
  Sliders,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { YallaLogoAvatar, YallaBrandCardArtwork } from './components/YallaLogoAvatar';
import {
  SyriaTargetingMaps,
  SYRIA_GOVERNORATES,
  PrecisionSpot,
} from './components/SyriaTargetingMaps';
import { Vault3DCard } from './components/Vault3DCard';
import { CampaignCelebrationModal } from './components/CampaignCelebrationModal';
import { WalletCelebrationModal } from './components/WalletCelebrationModal';
import { BottomNavigationBar, NavTabId } from './components/BottomNavigationBar';
import { RoiEstimatorCalculator } from './components/RoiEstimatorCalculator';
import { TransactionHistoryFeed } from './components/TransactionHistoryFeed';
import {
  openWhatsAppSupport,
  YALLA_SUPPORT_PHONE_DISPLAY,
  buildWhatsAppSupportUrl,
} from './utils/whatsapp';
import { triggerHaptic, HapticStyle } from './utils/haptics';

type InternalScreen =
  | 'onboarding'
  | 'home'
  | 'campaign'
  | 'targeting'
  | 'budget'
  | 'wallet'
  | 'report'
  | 'support';

type ReportMode = 'income' | 'expense';

interface AdVariation {
  h: string;
  t: string;
  c: string;
  v: string;
  angle?: string;
}

interface Campaign {
  id: string;
  n: string;
  b: number;
  k: number;
  st: 'نشطة' | 'متوقفة' | 'مكتملة' | 'قيد مراجعة الفريق';
  c: string;
  r: number;
  sp: number;
  goal: string;
  avatarBg: string;
}

interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  sypAmount: number;
  isPositive: boolean;
  badgeBg: string;
  initials: string;
}

interface ChatMessage {
  me: boolean;
  t: string;
  time: string;
}

const QUICK_LAUNCH_ITEMS = [
  {
    name: 'شاورما الشام',
    role: 'مطعم بدمشق',
    initials: 'ش',
    bg: 'from-[#14532D] to-[#22C55E]',
    desc: 'مطعم شاورما دمشقي أصيل في المزة، لحم ودجاج طازج يومياً مع توصيل ساخن خلال ٣٠ دقيقة.',
    goal: 'رسائل واتساب',
  },
  {
    name: 'أزياء حلب',
    role: 'متجر ألبسة',
    initials: 'أ',
    bg: 'from-[#064E3B] to-[#10B981]',
    desc: 'تشكيلة أزياء عصرية راقية في حلب مع خامات مكفولة وشحن سريع لكافة المحافظات السورية.',
    goal: 'مبيعات مباشرة',
  },
  {
    name: 'عيادة اللاذقية',
    role: 'تجميل وعناية',
    initials: 'ع',
    bg: 'from-[#1E3A8A] to-[#3B82F6]',
    desc: 'جلسات عناية بالبشرة وليزر بأحدث الأجهزة الطبية في اللاذقية مع استشارة مجانية هذا الأسبوع.',
    goal: 'رسائل واتساب',
  },
  {
    name: 'سارة',
    role: 'مختصة الحملات',
    initials: 'س',
    bg: 'from-[#78350F] to-[#D4AF37]',
    desc: 'support',
    goal: 'support',
  },
];

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const fmtAr = (n: number) => Math.round(n).toLocaleString('ar-EG');

export default function App() {
  // Desktop Studio 3-Screen Showcase vs Single Interactive Phone
  const [studioMode, setStudioMode] = useState<boolean>(true);
  // Active internal screen inside the main interactive phone
  const [activeScreen, setActiveScreen] = useState<InternalScreen>('home');

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3000);
  };

  // Global Haptic Listener for all buttons & interactive controls on mobile
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, [role="button"], input[type="range"]');
      if (interactive) {
        triggerHaptic('light');
      }
    };
    document.addEventListener('click', handleGlobalClick, { passive: true });
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Helper to navigate between internal screens with tactile haptic feedback
  const navigateToScreen = (screen: InternalScreen, haptic: HapticStyle = 'medium') => {
    triggerHaptic(haptic);
    setActiveScreen(screen);
  };

  // User & Balance State — "محمد مشارقة" & "$360.00"
  const [userName] = useState<string>('محمد مشارقة');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [accountId] = useState<string>('1657754');
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [hideBalance, setHideBalance] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(360.0);
  const [exchangeRate, setExchangeRate] = useState<number>(14500);
  const [metaConnected, setMetaConnected] = useState<boolean>(true);
  const [metaPageName] = useState<string>('يلا إعلان — محمد مشارقة');

  // Report / Analytics State (Right Screen)
  const [reportMode, setReportMode] = useState<ReportMode>('income');
  const [selectedBarIdx, setSelectedBarIdx] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);

  const chartMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
  const [incomeBars, setIncomeBars] = useState<number[]>([120, 185, 160, 210, 360, 240]);
  const [expenseBars, setExpenseBars] = useState<number[]>([65, 95, 80, 110, 145, 90]);

  // Campaigns & Transactions
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'c1',
      n: 'حملة شاورما الشام — دمشق',
      b: 120,
      k: 840,
      st: 'نشطة',
      c: 'دمشق، ريف دمشق',
      r: 28500,
      sp: 74,
      goal: 'رسائل واتساب',
      avatarBg: 'bg-[#166534] text-[#86EFAC]',
    },
    {
      id: 'c2',
      n: 'تخفيضات أزياء حلب الكبرى',
      b: 90,
      k: 520,
      st: 'نشطة',
      c: 'حلب، حمص',
      r: 19200,
      sp: 52,
      goal: 'مبيعات مباشرة',
      avatarBg: 'bg-[#065F46] text-[#A7F3D0]',
    },
    {
      id: 'c3',
      n: 'افتتاح عيادة اللاذقية',
      b: 60,
      k: 310,
      st: 'متوقفة',
      c: 'اللاذقية، طرطوس',
      r: 11400,
      sp: 35,
      goal: 'زيارة الموقع',
      avatarBg: 'bg-[#1E3A8A] text-[#93C5FD]',
    },
    {
      id: 'c4',
      n: 'عروض دمشق الذهبية — كافيه ومطعم',
      b: 150,
      k: 640,
      st: 'قيد مراجعة الفريق',
      c: 'دمشق (الشعلان، أبو رمانة)',
      r: 22000,
      sp: 0,
      goal: 'رسائل واتساب',
      avatarBg: 'bg-[#854D0E] text-[#FEF08A]',
    },
  ]);

  const [campaignFilter, setCampaignFilter] = useState<'all' | 'نشطة' | 'قيد مراجعة الفريق' | 'متوقفة'>('all');

  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: 'tx1',
      title: 'شحن محفظة شام كاش',
      subtitle: 'محمد مشارقة · تحويل محلي #849201',
      amount: 360.0,
      sypAmount: 360 * 14500,
      isPositive: true,
      badgeBg: 'bg-[#DCFCE7] text-[#15803D]',
      initials: 'ش',
    },
    {
      id: 'tx2',
      title: 'تمويل ميتا — بطاقة بوتيم',
      subtitle: 'حملة شاورما الشام · نشطة',
      amount: 120.0,
      sypAmount: 120 * 14500,
      isPositive: false,
      badgeBg: 'bg-[#FEE2E2] text-[#B91C1C]',
      initials: 'م',
    },
    {
      id: 'tx3',
      title: 'مكافأة انطلاق يلا إعلان',
      subtitle: 'هدية رصيد إعلاني للحساب الموثوق',
      amount: 40.0,
      sypAmount: 40 * 14500,
      isPositive: true,
      badgeBg: 'bg-[#FEF3C7] text-[#B45309]',
      initials: '★',
    },
  ]);

  // Live ticker for active campaigns
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.st !== 'نشطة') return c;
          const kAdd = Math.random() * 1.6;
          return {
            ...c,
            k: c.k + kAdd,
            r: c.r + kAdd * 27,
          };
        })
      );
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  // Internal Screen States: AI Campaign Generator, Syria Map Targeting, Budget, Sham Cash Wallet, Support
  const [desc, setDesc] = useState<string>(
    'مطعم شاورما دمشقي أصيل في المزة، لحم طازج يومياً وتوصيل ساخن خلال ٣٠ دقيقة.'
  );
  const [goal, setGoal] = useState<string>('رسائل واتساب');
  const [vars, setVars] = useState<AdVariation[]>([
    {
      h: 'جرّبه اليوم وستعود إليه دائماً',
      t: 'مطعم شاورما دمشقي أصيل في المزة، لحم طازج يومياً وتوصيل ساخن خلال ٣٠ دقيقة.\nجودة تلمسها من أول تجربة وخدمة تحترم وقتك.',
      c: 'راسلنا واتساب',
      v: 'صورة قريبة احترافية للمنتج بإضاءة دافئة ولمسات ذهبية',
    },
  ]);
  const [selVar, setSelVar] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [zoneTab, setZoneTab] = useState<'g' | 'p'>('g');
  const [selectedProvs, setSelectedProvs] = useState<string[]>(['دمشق', 'ريف دمشق']);
  const [spots, setSpots] = useState<PrecisionSpot[]>([
    {
      nm: 'المزة — أوتوستراد والشيخ سعد',
      k: 'شارع تجاري',
      r: 1000,
      x: 92,
      y: 108,
      lat: 33.4985,
      lng: 36.246,
      city: 'دمشق',
      address: 'أوتوستراد المزة، دمشق',
    },
  ]);
  const [dailyBudget, setDailyBudget] = useState<number>(10);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [previewPlatform, setPreviewPlatform] = useState<'fb' | 'ig'>('fb');
  const [mediaFile, setMediaFile] = useState<{ t: 'i' | 'v'; u: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Sham Cash Top-Up State
  const [topupInputUsd, setTopupInputUsd] = useState<number>(50);
  const [shamRefInput, setShamRefInput] = useState<string>('');
  const [copiedShamAcc, setCopiedShamAcc] = useState<boolean>(false);

  // Support Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      me: false,
      t: 'أهلاً بك يا محمد مشارقة! أنا سارة من فريق إدارة الحملات في «يلا إعلان». رصيد محفظتك الحالي $360.00 وجاهز لتمويل حملاتك عبر بطاقات بوتيم الدولية.',
      time: 'الآن',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSupportTyping, setIsSupportTyping] = useState<boolean>(false);

  // Campaign Celebration Modal State
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    title: string;
    totalBudget: number;
    botimAllocated: number;
    reach: number;
    locations: string[];
  }>({
    isOpen: false,
    title: '',
    totalBudget: 0,
    botimAllocated: 0,
    reach: 0,
    locations: [],
  });

  // Wallet Top-up Celebration State (Falling Golden Particles & Verified Receipt)
  const [walletCelebrationData, setWalletCelebrationData] = useState<{
    isOpen: boolean;
    amountUsd: number;
    newBalance: number;
    referenceNumber: string;
    methodName: string;
  }>({
    isOpen: false,
    amountUsd: 0,
    newBalance: 0,
    referenceNumber: '',
    methodName: 'شام كاش (Sham Cash)',
  });

  const adMoney = {
    b: dailyBudget * durationDays,
    c: dailyBudget * durationDays * 0.2,
    t: dailyBudget * durationDays * 1.2,
    syp: dailyBudget * durationDays * 1.2 * exchangeRate,
  };

  const calcEstimates = () => {
    const weight =
      SYRIA_GOVERNORATES.filter((g) => selectedProvs.includes(g.name)).reduce(
        (acc, g) => acc + g.weight,
        0
      ) +
      spots.length * 0.25;
    const estReach = weight * dailyBudget * 75 + dailyBudget * 320;
    const estClicks = dailyBudget * 9.5 * (0.5 + weight / 4);
    return { estReach, estClicks };
  };
  const { estReach, estClicks } = calcEstimates();

  // Generate Ads via Backend Gemini API
  const handleGenerateAds = async () => {
    const clean = desc.trim();
    if (!clean) {
      triggerHaptic('warning');
      showToast('يرجى كتابة وصف المنتج أو الخدمة أولاً');
      return;
    }
    triggerHaptic('medium');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: clean,
          goal,
          provinces: selectedProvs,
        }),
      });
      const data = await res.json();
      if (data.variations && Array.isArray(data.variations)) {
        setVars(data.variations);
        setSelVar(0);
        triggerHaptic('success');
        showToast('تم توليد ٣ إعلانات ذكية جاهزة للإطلاق ✦');
      }
    } catch {
      triggerHaptic('success');
      showToast('تم تجهيز النصوص الإعلانية بنجاح');
    } finally {
      setIsGenerating(false);
    }
  };

  // Media File Upload for Ad Preview
  const handleFileUpload = (file: File | undefined, type: 'i' | 'v', maxMb: number) => {
    if (!file) return;
    if (file.size > maxMb * 1048576) {
      triggerHaptic('warning');
      showToast(`الملف أكبر من ${maxMb} ميغابايت`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaFile({ t: type, u: reader.result });
        triggerHaptic('success');
        showToast('تم تحديث وسائط الإعلان بنجاح');
      }
    };
    reader.readAsDataURL(file);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomAvatar(reader.result);
        triggerHaptic('success');
        showToast('تم تحديث صورة الحساب بنجاح');
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm Sham Cash Top-up inside the internal Wallet Screen
  const handleConfirmShamCashTopup = () => {
    if (topupInputUsd < 20) {
      triggerHaptic('warning');
      showToast('الحد الأدنى للشحن هو $20');
      return;
    }
    if (!/^\d{6,14}$/.test(shamRefInput.trim())) {
      triggerHaptic('warning');
      showToast('يرجى إدخال رقم عملية شام كاش (٦ إلى ١٤ رقماً)');
      return;
    }
    triggerHaptic('success');
    const refCode = shamRefInput.trim();
    const newBal = walletBalance + topupInputUsd;
    setWalletBalance(newBal);
    setTransactions((prev) => [
      {
        id: 'tx-' + Date.now(),
        title: 'شحن محفظة شام كاش',
        subtitle: `محمد مشارقة · #${refCode}`,
        amount: topupInputUsd,
        sypAmount: topupInputUsd * exchangeRate,
        isPositive: true,
        badgeBg: 'bg-[#DCFCE7] text-[#15803D]',
        initials: 'ش',
      },
      ...prev,
    ]);
    setIncomeBars((prev) => {
      const next = [...prev];
      next[selectedBarIdx] += Math.round(topupInputUsd);
      return next;
    });
    setShamRefInput('');
    showToast(`تم شحن محفظتك بنجاح بمبلغ $${topupInputUsd.toFixed(2)}`);

    // Trigger Falling Golden Particles & Luxury Confirmation Modal
    setWalletCelebrationData({
      isOpen: true,
      amountUsd: topupInputUsd,
      newBalance: newBal,
      referenceNumber: refCode,
      methodName: 'شام كاش (Sham Cash)',
    });
  };

  // Instant 1-Tap Quick Top-Up (Triggered from Dashboard & Card)
  const handleQuickTopup = (amt: number) => {
    triggerHaptic('success');
    const newBal = walletBalance + amt;
    setWalletBalance(newBal);
    const refCode = Math.floor(100000 + Math.random() * 900000);
    setTransactions((prev) => [
      {
        id: 'tx-' + Date.now(),
        title: 'شحن فوري — شام كاش',
        subtitle: `محمد مشارقة · #${refCode}`,
        amount: amt,
        sypAmount: amt * exchangeRate,
        isPositive: true,
        badgeBg: 'bg-[#DCFCE7] text-[#15803D]',
        initials: 'ش',
      },
      ...prev,
    ]);
    setIncomeBars((prev) => {
      const next = [...prev];
      next[selectedBarIdx] += Math.round(amt);
      return next;
    });
    showToast(`تم شحن $${amt} فوراً وتغذية بطاقة يلا إعلان الافتراضية!`);

    // Trigger Falling Golden Particles & Luxury Confirmation Modal
    setWalletCelebrationData({
      isOpen: true,
      amountUsd: amt,
      newBalance: newBal,
      referenceNumber: String(refCode),
      methodName: 'شام كاش فوري',
    });
  };

  // Launch Campaign from Internal Budget/Checkout Screen
  const handleLaunchCampaign = (method: 'المحفظة' | 'شام كاش') => {
    if (method === 'المحفظة') {
      if (walletBalance < adMoney.t) {
        triggerHaptic('warning');
        showToast('رصيد المحفظة غير كافٍ، اشحن عبر شام كاش أولاً');
        setActiveScreen('wallet');
        return;
      }
      setWalletBalance((prev) => prev - adMoney.t);
    }

    triggerHaptic('success');
    const newCamp: Campaign = {
      id: 'c-' + Date.now(),
      n: desc.trim().slice(0, 26) || 'حملة يلا إعلان جديدة',
      b: adMoney.b,
      k: 18,
      st: 'نشطة',
      c: selectedProvs.join('، ') || 'دمشق',
      r: 640,
      sp: 4,
      goal,
      avatarBg: 'bg-[#166534] text-[#86EFAC]',
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    setTransactions((prev) => [
      {
        id: 'tx-' + Date.now(),
        title: `تمويل حملة (${method})`,
        subtitle: `${newCamp.n} · بطاقة بوتيم`,
        amount: adMoney.t,
        sypAmount: adMoney.syp,
        isPositive: false,
        badgeBg: 'bg-[#FEE2E2] text-[#B91C1C]',
        initials: 'ح',
      },
      ...prev,
    ]);
    setExpenseBars((prev) => {
      const next = [...prev];
      next[selectedBarIdx] += Math.round(adMoney.t);
      return next;
    });

    // Trigger Spectacular Celebration Animation & Modal
    setCelebrationData({
      isOpen: true,
      title: newCamp.n,
      totalBudget: adMoney.t,
      botimAllocated: adMoney.b,
      reach: estReach,
      locations: [...selectedProvs, ...spots.map((s) => s.nm)],
    });

    showToast('تم إطلاق الحملة وتخصيص بطاقة بوتيم الدولية بنجاح!');
  };

  // Support Chat Send
  const handleSendSupport = async () => {
    const text = chatInput.trim();
    if (!text) return;
    triggerHaptic('medium');
    setChatMessages((prev) => [...prev, { me: true, t: text, time: 'الآن' }]);
    setChatInput('');
    setIsSupportTyping(true);
    try {
      const res = await fetch('/api/support-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          activeCampaignsCount: campaigns.filter((c) => c.st === 'نشطة').length,
          walletBalance,
        }),
      });
      const data = await res.json();
      triggerHaptic('light');
      setChatMessages((prev) => [
        ...prev,
        {
          me: false,
          t:
            data.reply ||
            'استلمنا رسالتك يا محمد، يراجع مختص الحملات في يلا إعلان طلبك الآن لضمان أعلى المبيعات.',
          time: 'الآن',
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          me: false,
          t: 'تم استلام رسالتك، فريق إدارة الحملات يتابع حسابك الإعلاني الآن.',
          time: 'الآن',
        },
      ]);
    } finally {
      setIsSupportTyping(false);
    }
  };

  const currentAdPreview: AdVariation = vars[selVar] || {
    h: 'شاورما الشام الأصيلة — توصيل خلال ٣٠ دقيقة',
    t: desc.trim()
      ? `${desc.trim()}\nجودة تلمسها من أول تجربة وعروض خاصة لزبائننا هذا الأسبوع.`
      : 'صف منتجك ليقوم الذكاء الاصطناعي بكتابة إعلانك.',
    c:
      goal === 'رسائل واتساب'
        ? 'راسلنا واتساب'
        : goal === 'زيارة الموقع'
        ? 'اطلب الآن'
        : 'اشترِ الآن',
    v: 'تصميم احترافي يبرز جودة المنتج مع شارة خصم ذهبية',
  };

  // ============================================================================
  // SHARED HEADER + 4 SQUIRCLES FOR INTERNAL SCREENS
  // ============================================================================
  const renderSharedEmeraldHeader = (activeSquircle?: InternalScreen) => (
    <div className="p-6 pb-5 relative z-10 shrink-0">
      {/* شريط الساعة والشبكة */}
      <div
        className="flex items-center justify-between text-white/90 text-xs font-semibold px-1 mb-3.5"
        dir="ltr"
      >
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-2.5 border border-white/80 rounded-[2px] relative">
            <span className="absolute inset-0.5 bg-[#6EE787]" />
          </span>
          <span className="text-[10px] text-[#6EE787] font-bold">5G</span>
        </div>
      </div>

      {/* علامة الدولار المائية الناعمة في الخلفية */}
      <div
        aria-hidden="true"
        className="absolute top-20 left-1/2 -translate-x-1/2 text-[125px] font-black text-[#6EE787]/[0.07] pointer-events-none select-none leading-none"
      >
        $
      </div>

      {/* صف المستخدم: شعار يلا إعلان كصورة لمحمد مشارقة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YallaLogoAvatar
            size="md"
            customAvatar={customAvatar}
            onClick={() => navigateToScreen('support')}
          />
          <div>
            <span className="text-[11px] text-white/75 block">صباح الخير،</span>
            <b className="text-sm font-extrabold text-white block">{userName}</b>
          </div>
        </div>

        {activeScreen !== 'home' ? (
          <button
            type="button"
            onClick={() => navigateToScreen('home', 'light')}
            title="العودة للرئيسية"
            className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-white/20 active:scale-95 transition cursor-pointer"
          >
            <span>الرئيسية</span>
            <ArrowLeft className="w-3.5 h-3.5 text-[#6EE787]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigateToScreen('support')}
            title="فريق إدارة الحملات"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white grid place-items-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#86EFAC]" />
          </button>
        )}
      </div>

      {/* إجمالي رصيد المحفظة 360$ */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/75 font-medium">إجمالي رصيد المحفظة</span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setHideBalance((prev) => !prev);
            }}
            aria-label="إخفاء أو إظهار الرصيد"
            className="w-8 h-8 rounded-full bg-white/10 text-white/80 grid place-items-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
          >
            {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2.5 mt-0.5" dir="ltr">
          <b className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
            {hideBalance
              ? '$ ••••••'
              : `$ ${walletBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </b>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6EE787] text-[#071910] text-[11px] font-extrabold tabular-nums">
            ↗ 12%
          </span>
        </div>

        {/* شريط الحالة ورقم الحساب القابل للنسخ */}
        <div className="flex items-center justify-between mt-2.5 text-[11px]">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 font-semibold">
            الحالة: نشط وموثوق
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('success');
              navigator.clipboard?.writeText(accountId);
              setCopiedId(true);
              showToast('تم نسخ معرّف الحساب الإعلاني');
              setTimeout(() => setCopiedId(false), 2000);
            }}
            dir="ltr"
            className="px-3 py-1 rounded-full bg-white/10 text-white/90 font-mono flex items-center gap-1.5 hover:bg-white/20 active:scale-95 transition cursor-pointer"
          >
            <span>ID: {accountId}</span>
            {copiedId ? (
              <Check className="w-3 h-3 text-[#6EE787]" />
            ) : (
              <Copy className="w-3 h-3 opacity-75" />
            )}
          </button>
        </div>
      </div>

      {/* الأزرار الأربعة المربعة الدائرية للتنقل التفاعلي بين الواجهات الداخلية مع اهتزاز لمسي */}
      <div className="grid grid-cols-4 gap-2.5 mt-4">
        <button
          type="button"
          onClick={() => navigateToScreen('wallet')}
          className={`h-[64px] rounded-[22px] flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer ${
            activeSquircle === 'wallet'
              ? 'bg-white text-[#0B1911] shadow-lg font-extrabold'
              : 'bg-[#132E1E]/90 border border-[#6EE787]/35 text-white hover:bg-[#1A3E29]'
          }`}
        >
          <ArrowDownLeft
            className={`w-5 h-5 ${
              activeSquircle === 'wallet' ? 'text-[#0B1911]' : 'text-[#6EE787]'
            }`}
          />
          <span className="text-[10px] font-bold">شحن شام</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToScreen('budget')}
          className={`h-[64px] rounded-[22px] flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer ${
            activeSquircle === 'budget'
              ? 'bg-white text-[#0B1911] shadow-lg font-extrabold'
              : 'bg-[#2D2816]/90 border border-[#D4AF37]/35 text-white hover:bg-[#3D361E]'
          }`}
        >
          <ArrowUpRight
            className={`w-5 h-5 ${
              activeSquircle === 'budget' ? 'text-[#0B1911]' : 'text-[#FDE047]'
            }`}
          />
          <span className="text-[10px] font-bold">تمويل ميتا</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToScreen('campaign')}
          className={`h-[64px] rounded-[22px] flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer ${
            activeSquircle === 'campaign'
              ? 'bg-white text-[#0B1911] shadow-lg font-extrabold'
              : 'bg-[#102329]/90 border border-cyan-400/30 text-white hover:bg-[#17323A]'
          }`}
        >
          <Plus
            className={`w-5 h-5 ${
              activeSquircle === 'campaign' ? 'text-[#0B1911]' : 'text-white'
            }`}
          />
          <span className="text-[10px] font-bold">حملة ذكية</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToScreen('targeting')}
          className={`h-[64px] rounded-[22px] flex flex-col items-center justify-center gap-1 active:scale-95 transition cursor-pointer ${
            activeSquircle === 'targeting' || !activeSquircle || activeSquircle === 'home'
              ? 'bg-white text-[#0B1911] shadow-lg font-extrabold'
              : 'bg-[#132E1E]/90 border border-[#6EE787]/35 text-white hover:bg-[#1A3E29]'
          }`}
        >
          <LayoutGrid
            className={`w-5 h-5 ${
              activeSquircle === 'targeting' || !activeSquircle || activeSquircle === 'home'
                ? 'text-[#0B1911]'
                : 'text-[#6EE787]'
            }`}
          />
          <span className="text-[10px] font-extrabold">الاستهداف</span>
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // SHARED FLUID BOTTOM NAVIGATION DOCK (Glowing Capsule & Micro-Bounce Icons)
  // ============================================================================
  const renderPhoneBottomDock = (currentNav: InternalScreen) => (
    <BottomNavigationBar
      activeScreen={currentNav}
      onNavigate={(tab) => {
        if (tab === 'home') navigateToScreen('home', 'light');
        else if (tab === 'campaign') navigateToScreen('campaign', 'light');
        else if (tab === 'wallet') navigateToScreen('wallet', 'light');
        else if (tab === 'support') navigateToScreen('support', 'light');
      }}
      unreadSupportCount={1}
    />
  );

  // ============================================================================
  // LEFT PHONE: 3D BOTIM CARD & ONBOARDING SHOWCASE
  // ============================================================================
  const renderScreenOne = () => (
    <div className="w-full max-w-[385px] h-[800px] rounded-[44px] emerald-aurora p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_28px_70px_rgba(0,0,0,0.55)] border border-white/15 select-none mx-auto">
      <div
        className="flex items-center justify-between text-white/90 text-xs font-semibold px-2 pt-1"
        dir="ltr"
      >
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-2.5 border border-white/80 rounded-[2px] relative">
            <span className="absolute inset-0.5 bg-[#6EE787]" />
          </span>
          <span className="text-[10px] text-[#6EE787] font-bold">5G</span>
        </div>
      </div>

      {/* هوية محمد مشارقة المصغرة أعلى شاشة البطاقة */}
      <div className="flex items-center justify-between px-1 mt-2">
        <div className="flex items-center gap-2.5">
          <YallaLogoAvatar size="sm" customAvatar={customAvatar} />
          <div>
            <span className="text-[10px] text-[#86EFAC] font-bold block">يلا إعلان — YALLA ADS</span>
            <b className="text-xs text-white font-extrabold block">{userName}</b>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigateToScreen('targeting')}
          className="px-3 py-1 rounded-full bg-[#6EE787]/15 border border-[#6EE787]/35 text-[#86EFAC] text-[10px] font-bold cursor-pointer hover:bg-[#6EE787]/25 active:scale-95 transition"
        >
          خريطة سوريا
        </button>
      </div>

      {/* البطاقة المصرفية الإعلانية الفاخرة ثلاثية الأبعاد (Yalla Ads Luxury Metallic Card) */}
      <div className="relative my-auto py-4 flex items-center justify-center">
        <div className="w-64 h-44 rounded-[28px] bg-[#0E2C1D]/80 border border-[#D4AF37]/30 absolute -top-1 right-6 -rotate-6 backdrop-blur-md" />

        <div
          onClick={() => navigateToScreen('wallet')}
          className="w-[296px] h-[195px] rounded-[28px] text-white p-5 shadow-[0_25px_50px_rgba(0,0,0,0.7)] -rotate-[10deg] hover:-rotate-[4deg] active:scale-[0.98] transition-all duration-300 cursor-pointer relative overflow-hidden border border-[#D4AF37]/60"
          style={{
            background: 'linear-gradient(135deg, #051A11 0%, #0D2E20 28%, #164630 50%, #0D2E20 74%, #04140D 100%)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 35px rgba(212, 175, 55, 0.35)',
          }}
        >
          {/* Specular Shimmering Light-Sweep Beam */}
          <div className="metallic-light-sweep-beam" />

          {/* Top Brand Bar */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-[#FDE047] text-[#071910] text-[10px] font-black grid place-items-center shadow-xs">
                يلا
              </div>
              <span className="text-xs font-black tracking-wider text-white">YALLA ADS</span>
            </div>
            <span
              dir="ltr"
              className="px-2.5 py-0.5 rounded-full border border-[#D4AF37]/50 text-[10px] font-extrabold text-[#FDE047] bg-black/40"
            >
              META VIRTUAL
            </span>
          </div>

          {/* Middle: Live Balance & Golden EMV Chip */}
          <div className="relative z-10 mt-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/70 block">رصيد تمويل ميتا المتاح</span>
              <div
                dir="ltr"
                className="text-3xl font-black tracking-tight text-[#6EE787] tabular-nums"
              >
                ${' '}
                {walletBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            {/* Golden EMV Chip */}
            <div className="w-9 h-6 rounded bg-gradient-to-tr from-[#D4AF37] via-[#FDE047] to-[#B45309] p-0.5 border border-[#FDE047]/40 shadow-xs">
              <div className="h-1.5 border-b border-[#78350F]/40" />
            </div>
          </div>

          {/* Bottom Cardholder & Number */}
          <div className="flex items-center justify-between mt-3 pt-1 relative z-10" dir="ltr">
            <span className="text-xs font-black tracking-wider text-[#D4AF37]">
              {userName}
            </span>
            <span className="text-xs font-mono font-bold text-white/80">4532 •••• 8492</span>
          </div>
        </div>
      </div>

      {/* النصوص السفلية وأزرار الانطلاق */}
      <div className="space-y-4 z-10 pb-1">
        <div className="text-center space-y-2 px-1">
          <h2 className="text-[24px] font-extrabold text-white leading-snug">
            إعلانات أذكى لنموّ أعمالك كل يوم
          </h2>
          <p className="text-xs text-white/75 leading-relaxed">
            شغّل إعلانك بإيدك بالذكاء الاصطناعي، ادفع محلياً عبر شام كاش، وفريق كامل يدير ويحسّن حملتك لدى ميتا.
          </p>
        </div>

        {/* مؤشر الشرائح التفاعلي */}
        <div className="flex items-center justify-center gap-2 py-1">
          {(['onboarding', 'home', 'report'] as InternalScreen[]).map((scr) => (
            <button
              key={scr}
              type="button"
              onClick={() => navigateToScreen(scr, 'light')}
              className={`rounded-full transition-all cursor-pointer ${
                activeScreen === scr ? 'w-3 h-3 bg-[#6EE787]' : 'w-1.5 h-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* أزرار Skip / Let's Get Started */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigateToScreen('home')}
            className="px-6 py-3.5 rounded-full bg-white text-[#091E12] font-extrabold text-xs hover:bg-white/90 active:scale-95 transition cursor-pointer shrink-0 shadow-md"
          >
            الرئيسية
          </button>

          <button
            type="button"
            onClick={() => navigateToScreen('campaign')}
            className="flex-1 py-2 pr-5 pl-2 rounded-full bg-gradient-to-r from-[#5EEAD4] via-[#6EE787] to-[#86EFAC] text-[#091E12] font-extrabold text-xs flex items-center justify-between shadow-lg hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
          >
            <span>ابدأ حملتك الآن</span>
            <span className="w-10 h-10 rounded-full bg-[#0B1D13] text-white grid place-items-center">
              <ArrowLeft className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // CENTER PHONE: DYNAMIC INTERNAL WORKSPACE (Home / Campaign / Targeting / Budget / Wallet / Support)
  // ============================================================================
  const renderCenterInteractivePhone = () => {
    if (!studioMode && activeScreen === 'report') {
      return renderScreenThree();
    }
    if (!studioMode && activeScreen === 'onboarding') {
      return renderScreenOne();
    }

    return (
      <div className="w-full max-w-[385px] h-[800px] rounded-[44px] emerald-aurora flex flex-col justify-between relative overflow-hidden shadow-[0_28px_70px_rgba(0,0,0,0.55)] border border-white/15 mx-auto">
        {/* الهيدر المشترك مع صورة محمد مشارقة ورصيد 360$ والأزرار الأربعة */}
        {renderSharedEmeraldHeader(activeScreen)}

        {/* الورقة البيضاء السفلية المنحنية التي تتبدل محتوياتها التفاعلية بنفس النمط والألوان */}
        <div className="flex-1 bg-[#F6F8F5] text-[#0D1B12] rounded-t-[34px] p-5 pb-3 flex flex-col justify-between overflow-y-auto no-scrollbar">
          {/* ------------------------------------------------------------------
              1. الواجهة الرئيسية (HOME SCREEN)
             ------------------------------------------------------------------ */}
          {(activeScreen === 'home' ||
            activeScreen === 'onboarding' ||
            activeScreen === 'report') && (
            <div className="space-y-4">
              {/* بطاقة المكافأة وإدارة الفريق الخضراء الفاتحة */}
              <div className="rounded-[26px] bg-gradient-to-br from-[#74E386] via-[#99EFA6] to-[#C8FACC] p-4 flex items-center justify-between gap-3 shadow-sm border border-[#4ADE80]/40 relative overflow-hidden">
                <div className="space-y-2 z-10">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#092012]">
                      شغّل إعلانك بإيدك، وفريق يدير الحملة
                    </h3>
                    <p className="text-[11px] text-[#092012]/80 mt-0.5">
                      مراجعة وتحسين يومي لضمان أعلى مبيعات!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => navigateToScreen('wallet')}
                      className="px-3 py-1 rounded-full border border-[#092012]/40 text-[10px] font-bold text-[#092012] hover:bg-white/30 active:scale-95 transition cursor-pointer"
                    >
                      شحن شام كاش
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToScreen('campaign')}
                      className="px-4 py-1 rounded-full bg-[#111D15] text-white text-[10px] font-extrabold hover:bg-black active:scale-95 transition cursor-pointer"
                    >
                      إطلاق حملة
                    </button>
                  </div>
                </div>

                {/* شعار يلا إعلان الفني المدمج */}
                <YallaBrandCardArtwork />
              </div>

              {/* ------------------------------------------------------------------
                  1. شريط الإطلاق السريع وقوالب الأعمال
                 ------------------------------------------------------------------ */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-[#0D1B12]">
                    إطلاق سريع وفريق التسويق
                  </h4>
                  <button
                    type="button"
                    onClick={() => navigateToScreen('targeting')}
                    className="text-[11px] font-bold text-[#15803D] hover:underline cursor-pointer"
                  >
                    خريطة سوريا
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center">
                  {QUICK_LAUNCH_ITEMS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        if (item.desc === 'support') {
                          setActiveScreen('support');
                        } else {
                          setDesc(item.desc);
                          setGoal(item.goal);
                          setActiveScreen('campaign');
                          showToast(`تم اختيار قالب: ${item.name}`);
                        }
                      }}
                      className="flex flex-col items-center gap-1 group active:scale-95 transition cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.bg} text-white font-extrabold text-sm grid place-items-center shadow-sm group-hover:scale-105 transition`}
                      >
                        {item.initials}
                      </div>
                      <span className="text-[10px] font-bold text-[#1F2E24] truncate w-full">
                        {item.name}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      setDesc('');
                      setActiveScreen('campaign');
                    }}
                    className="flex flex-col items-center gap-1 group active:scale-95 transition cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#34D399] text-[#071910] grid place-items-center shadow-sm group-hover:scale-105 transition">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#1F2E24]">جديد</span>
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------------
                  2. محفزات الشحن الفوري للمحفظة (Quick-Action Wallet Top-Up Triggers)
                 ------------------------------------------------------------------ */}
              <div className="rounded-[24px] bg-[#0A2216] text-white p-3.5 border border-[#6EE787]/30 shadow-md space-y-2.5 relative overflow-hidden">
                <div className="metallic-light-sweep-beam opacity-30" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#6EE787]/20 border border-[#6EE787]/40 text-[#6EE787] grid place-items-center">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <b className="text-xs font-black block">شحن فوري — شام كاش</b>
                      <span className="text-[10px] text-white/70 block">
                        تغذية بطاقة يلا إعلان بنقرة واحدة ($1 = {exchangeRate.toLocaleString('ar-EG')} ل.س)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToScreen('wallet')}
                    className="text-[10px] font-black text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    تفاصيل البطاقة ↻
                  </button>
                </div>

                {/* Quick 1-Tap Buttons */}
                <div className="grid grid-cols-4 gap-1.5 relative z-10">
                  {[25, 50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickTopup(amt)}
                      className="py-2 px-1 rounded-xl bg-white/10 hover:bg-[#6EE787]/20 border border-white/15 hover:border-[#6EE787]/50 text-white flex flex-col items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs group"
                    >
                      <b className="text-xs font-black group-hover:text-[#6EE787] text-[#D4AF37]">
                        +${amt}
                      </b>
                      <span className="text-[9px] text-white/60 font-mono">
                        {fmtAr(amt * exchangeRate)} ل.س
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ------------------------------------------------------------------
                  3. مؤشرات وصول الجمهور المستهدف في سوريا (Target Audience Reach Insights)
                 ------------------------------------------------------------------ */}
              <div className="rounded-[24px] bg-white p-3.5 border border-black/5 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] text-[#15803D] grid place-items-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#0D1B12]">
                        مؤشرات وصول الجمهور في سوريا
                      </h4>
                      <span className="text-[10px] text-[#5B6E61] block">
                        إجمالي الجمهور المتاح عبر شبكة ميتا
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#15803D]/10 text-[#15803D] px-2 py-0.5 rounded-full border border-[#15803D]/20">
                    4.8M مستخدم نشط
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-[#F8FAF8] border border-black/5 rounded-xl p-2">
                    <span className="text-[9px] text-[#5B6E61] block font-bold">متوسط كلفة النقرة</span>
                    <b className="text-xs font-black text-[#15803D] tabular-nums" dir="ltr">$0.04 CPC</b>
                  </div>
                  <div className="bg-[#F8FAF8] border border-black/5 rounded-xl p-2">
                    <span className="text-[9px] text-[#5B6E61] block font-bold">كلفة الألف ظهور</span>
                    <b className="text-xs font-black text-[#0D1B12] tabular-nums" dir="ltr">$1.18 CPM</b>
                  </div>
                  <div className="bg-[#F8FAF8] border border-black/5 rounded-xl p-2">
                    <span className="text-[9px] text-[#5B6E61] block font-bold">معدل التفاعل</span>
                    <b className="text-xs font-black text-[#B45309] tabular-nums" dir="ltr">4.8% CTR</b>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px] text-[#5B6E61]">
                  <span>المدن الأكثر نشاطاً: دمشق (38%)، حلب (27%)، حمص (18%)</span>
                  <button
                    type="button"
                    onClick={() => navigateToScreen('targeting')}
                    className="font-bold text-[#15803D] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>الخريطة التفاعلية</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------------
                  4. تبويبات وإدارة الحملات النشطة (Active Campaign Management Tabs)
                 ------------------------------------------------------------------ */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#0D1B12]">إدارة الحملات الإعلانية</h4>
                  <span className="text-[10px] font-bold text-[#15803D]">
                    {campaigns.filter((c) => c.st === 'نشطة').length} نشطة الآن
                  </span>
                </div>

                {/* Filter Tabs Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'all', label: 'الكل', count: campaigns.length },
                    {
                      id: 'نشطة',
                      label: 'نشطة',
                      count: campaigns.filter((c) => c.st === 'نشطة').length,
                      color: 'text-[#15803D]',
                    },
                    {
                      id: 'قيد مراجعة الفريق',
                      label: 'قيد المراجعة',
                      count: campaigns.filter((c) => c.st === 'قيد مراجعة الفريق').length,
                      color: 'text-[#B45309]',
                    },
                    {
                      id: 'متوقفة',
                      label: 'متوقفة',
                      count: campaigns.filter((c) => c.st === 'متوقفة').length,
                      color: 'text-gray-500',
                    },
                  ].map((f) => {
                    const isSelected = campaignFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setCampaignFilter(f.id as any);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#111D15] text-white shadow-xs'
                            : 'bg-white border border-black/10 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected
                              ? 'bg-white/20 text-[#6EE787]'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filtered Campaign Cards List */}
                <div className="space-y-2">
                  {campaigns
                    .filter((c) => campaignFilter === 'all' || c.st === campaignFilter)
                    .map((c) => {
                      const isExpanded = expandedCampaignId === c.id;
                      return (
                        <div
                          key={c.id}
                          className="bg-white rounded-2xl p-2.5 px-3 border border-black/5 shadow-2xs hover:border-[#4ADE80] transition"
                        >
                          <div
                            onClick={() => {
                              triggerHaptic('light');
                              setExpandedCampaignId(isExpanded ? null : c.id);
                            }}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-full ${c.avatarBg} font-bold text-xs grid place-items-center shrink-0 relative`}
                              >
                                {c.n.charAt(0)}
                                {c.st === 'نشطة' && (
                                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                    <span className="radar-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E] border-2 border-white" />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <b className="text-xs font-extrabold text-[#0D1B12] block truncate">
                                  {c.n}
                                </b>
                                <span className="text-[10px] text-[#5B6E61] block truncate">
                                  {c.c} · {fmtAr(c.r)} وصول · {fmtAr(c.k)} نقرة
                                </span>
                              </div>
                            </div>
                            <div className="text-left shrink-0">
                              <b
                                className="text-xs font-extrabold text-[#0D1B12] tabular-nums block"
                                dir="ltr"
                              >
                                ${c.b}
                              </b>
                              {c.st === 'نشطة' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-black border border-[#22C55E]/40 badge-pulse-live shadow-xs">
                                  <span className="relative flex h-2 w-2">
                                    <span className="radar-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-80" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                                  </span>
                                  <span>نشطة · تتبع حي</span>
                                </span>
                              ) : (
                                <span
                                  className={`text-[10px] font-bold ${
                                    c.st === 'قيد مراجعة الفريق'
                                      ? 'text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#F59E0B]/30'
                                      : 'text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'
                                  }`}
                                >
                                  {c.st}
                                </span>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 pt-2.5 border-t border-black/5 space-y-2 text-[11px]">
                              {c.st === 'نشطة' && (
                                <div className="w-full flex items-center justify-between bg-[#DCFCE7]/80 border border-[#22C55E]/40 rounded-xl px-2.5 py-1.5 text-[10px] text-[#15803D] font-bold">
                                  <span className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                      <span className="radar-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-80" />
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                                    </span>
                                    <span>متابعة لحظية وتتبع مستمر لأداء الإعلان في سوريا</span>
                                  </span>
                                  <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded font-extrabold shadow-2xs">
                                    LIVE 24/7
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[#5B6E61]">
                                  المصروف: <b className="text-[#0D1B12]">${fmt(c.sp)}</b> · الهدف: {c.goal}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic('light');
                                      openWhatsAppSupport({
                                        topic: 'campaign',
                                        campaignTitle: c.n,
                                        budget: c.b,
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#15803D] text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition"
                                  >
                                    <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                    <span>استشارة</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic('light');
                                      setActiveScreen('report');
                                    }}
                                    className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0D1B12] text-[10px] font-bold cursor-pointer transition"
                                  >
                                    التقرير
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic('medium');
                                      const nextSt = c.st === 'نشطة' ? 'متوقفة' : 'نشطة';
                                      setCampaigns((prev) =>
                                        prev.map((item) =>
                                          item.id === c.id ? { ...item, st: nextSt } : item
                                        )
                                      );
                                      showToast(
                                        nextSt === 'نشطة'
                                          ? 'تم استئناف الحملة بنجاح'
                                          : 'تم إيقاف الحملة مؤقتاً'
                                      );
                                    }}
                                    className="px-3 py-1 rounded-full bg-[#111D15] text-white text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition cursor-pointer"
                                  >
                                    {c.st === 'نشطة' ? (
                                      <>
                                        <Pause className="w-3 h-3" />
                                        <span>إيقاف</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3 h-3" />
                                        <span>تشغيل</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* ------------------------------------------------------------------
                  5. شريط فريق الدعم المباشر ومستشار الحملات (Direct Support & Team Link)
                 ------------------------------------------------------------------ */}
              <div className="rounded-[24px] bg-gradient-to-br from-[#112F21] to-[#081A12] text-white p-3.5 border border-[#6EE787]/30 shadow-md space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#6EE787]/20 border border-[#6EE787]/40 text-[#6EE787] grid place-items-center relative">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="absolute 0 top-0 right-0 w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                    </div>
                    <div>
                      <b className="text-xs font-black block">فريق يلا إعلان المباشر</b>
                      <span className="text-[10px] text-[#86EFAC] block font-bold">
                        أخصائي الحملات متصل الآن · متابعة 24/7
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-[#6EE787]/20 text-[#6EE787] border border-[#6EE787]/40 px-2 py-0.5 rounded-full font-bold">
                    ONLINE
                  </span>
                </div>

                <p className="text-[10px] text-white/70 leading-relaxed">
                  فريقنا يتابع إعلاناتك لدى ميتا ويراجع الاستهداف الجغرافي يومياً لضمان أعلى عائد واستثمار كل دولار.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigateToScreen('support')}
                    className="flex-1 py-2 rounded-xl bg-[#6EE787] hover:bg-[#5ED277] text-[#071910] text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>محادثة فورية مع الفريق</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      openWhatsAppSupport({ topic: 'general' });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-[#071910] text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                    title={`واتساب مباشر (${YALLA_SUPPORT_PHONE_DISPLAY})`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>واتساب</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              2. الواجهة الداخلية: إنشاء حملة بالذكاء الاصطناعي ومعاينة الإعلان (CAMPAIGN SCREEN)
             ------------------------------------------------------------------ */}
          {activeScreen === 'campaign' && (
            <div className="space-y-3.5">
              <div className="rounded-[24px] bg-gradient-to-br from-[#74E386] via-[#99EFA6] to-[#C8FACC] p-3.5 text-[#092012] shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-extrabold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#15803D]" />
                    <span>توليد الإعلان بالذكاء الاصطناعي</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full border border-[#092012]/35 text-[10px] font-bold">
                    خطوة ١ من ٣
                  </span>
                </div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="صف منتجك أو خدمتك ببساطة..."
                  className="w-full min-h-[64px] bg-white/85 border border-[#092012]/15 rounded-2xl p-2.5 text-xs text-[#092012] font-semibold focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex gap-1">
                    {['رسائل واتساب', 'زيارة الموقع', 'مبيعات مباشرة'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setGoal(g);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                          goal === g
                            ? 'bg-[#111D15] text-white'
                            : 'bg-white/60 text-[#092012]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGenerateAds}
                    className="px-3.5 py-1 rounded-full bg-[#111D15] text-[#6EE787] text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>ولّد ✦</span>
                  </button>
                </div>
              </div>

              {vars.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {vars.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelVar(i);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold shrink-0 cursor-pointer ${
                        selVar === i
                          ? 'bg-[#111D15] text-white'
                          : 'bg-white text-[#0D1B12] border border-black/10'
                      }`}
                    >
                      نموذج {fmtAr(i + 1)}: {v.h.slice(0, 18)}…
                    </button>
                  ))}
                </div>
              )}

              {/* معاينة الإعلان المباشرة */}
              <div className="bg-white rounded-[24px] p-3 border border-black/8 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <YallaLogoAvatar size="sm" customAvatar={customAvatar} />
                    <div>
                      <b className="text-[11px] font-extrabold text-[#0D1B12] block">
                        {metaPageName}
                      </b>
                      <span className="text-[9px] text-gray-500 block">
                        ممول · {previewPlatform === 'fb' ? 'Facebook' : 'Instagram'}
                      </span>
                    </div>
                  </div>
                  <div className="flex bg-[#F1F4F1] p-0.5 rounded-full">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setPreviewPlatform('fb');
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        previewPlatform === 'fb' ? 'bg-[#111D15] text-white' : 'text-gray-600'
                      }`}
                    >
                      فيسبوك
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setPreviewPlatform('ig');
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        previewPlatform === 'ig' ? 'bg-[#111D15] text-white' : 'text-gray-600'
                      }`}
                    >
                      إنستغرام
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#1c1e21] leading-relaxed line-clamp-2">
                  {currentAdPreview.t}
                </p>

                <div className="h-28 rounded-2xl emerald-aurora text-white grid place-items-center text-center p-3 relative overflow-hidden">
                  {mediaFile ? (
                    mediaFile.t === 'v' ? (
                      <video
                        src={mediaFile.u}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaFile.u}
                        alt="معاينة"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold text-[#86EFAC] block">
                        {currentAdPreview.v}
                      </span>
                      <div className="flex justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>رفع صورة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Video className="w-3 h-3" />
                          <span>فيديو</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'i', 8)}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'v', 25)}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <b className="text-[11px] text-[#0D1B12] truncate">{currentAdPreview.h}</b>
                  <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold shrink-0">
                    {currentAdPreview.c}
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------------
                  حاسبة العائد والوصول التقديري ROI (ROI & Sales Estimator)
                 ------------------------------------------------------------------ */}
              <RoiEstimatorCalculator
                currentDailyBudget={dailyBudget}
                currentDurationDays={durationDays}
                onApplyBudget={(newDaily, newDays) => {
                  setDailyBudget(newDaily);
                  setDurationDays(newDays);
                  showToast(`تم تطبيق الميزانية: $${newDaily}/يوم لمدة ${newDays} أيام`);
                }}
                compact={true}
              />

              <button
                type="button"
                onClick={() => navigateToScreen('targeting')}
                className="w-full py-2.5 px-4 rounded-full bg-[#111D15] text-white font-extrabold text-xs flex items-center justify-between cursor-pointer hover:bg-black active:scale-[0.98] transition"
              >
                <span>التالي: خريطة سوريا والاستهداف الدقيق</span>
                <ArrowLeft className="w-4 h-4 text-[#6EE787]" />
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------------
              3. الواجهة الداخلية: الخرائط السورية المطوّرة (ENHANCED TARGETING MAPS)
             ------------------------------------------------------------------ */}
          {activeScreen === 'targeting' && (
            <SyriaTargetingMaps
              zoneTab={zoneTab}
              setZoneTab={setZoneTab}
              selectedProvs={selectedProvs}
              setSelectedProvs={setSelectedProvs}
              spots={spots}
              setSpots={setSpots}
              estReach={estReach}
              onNext={() => setActiveScreen('budget')}
              onShowToast={showToast}
            />
          )}

          {/* ------------------------------------------------------------------
              4. الواجهة الداخلية: تمويل ميتا والميزانية (BUDGET & META FUNDING SCREEN)
             ------------------------------------------------------------------ */}
          {activeScreen === 'budget' && (
            <div className="space-y-3.5">
              {/* شريط الثقة الدائم */}
              <div className="rounded-2xl bg-gradient-to-r from-[#092214] via-[#0F3824] to-[#092214] p-3 text-white border border-[#6EE787]/35 shadow-md flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F59E0B] flex items-center justify-center font-black text-black text-xs shrink-0 shadow-sm">
                  🛡️
                </div>
                <div className="text-[11px] leading-snug">
                  <b className="text-[#D4AF37] block font-black">
                    شغّل إعلانك بإيدك، وفريق كامل بيدير الحملة معك
                  </b>
                  <span className="text-white/80 text-[10px]">
                    فريق مختص يتابع إعلانك على ميتا يومياً لضمان أعلى عائد واستبعاد النقرات الوهمية.
                  </span>
                </div>
              </div>

              {/* بطاقة التمويل الشاملة وتفصيل عمولة الـ ٢٠٪ الشفافة */}
              <div className="rounded-[26px] bg-gradient-to-br from-[#6EE787] via-[#86EFAC] to-[#B8F5BE] p-4 text-[#092012] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#092012]/75 block">
                      إجمالي تمويل الحملة (شامل عمولة ٢٠٪)
                    </span>
                    <b className="text-2xl font-black tabular-nums" dir="ltr">
                      $ {adMoney.t.toFixed(2)}
                    </b>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#092012] text-[#6EE787] text-[10px] font-extrabold tabular-nums">
                    {fmtAr(adMoney.syp)} ل.س
                  </span>
                </div>

                {/* تفصيل الشفافية: صافي الإعلان + عمولة الـ ٢٠٪ */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-2.5 border border-black/5">
                    <span className="text-[#092012]/70 block text-[10px]">صافي بطاقة بوتيم لميتا</span>
                    <b className="text-sm font-black tabular-nums text-[#092012]" dir="ltr">
                      ${adMoney.b.toFixed(2)}
                    </b>
                    <small className="text-[9px] text-[#15803D] block font-bold">رصيد إعلانات صافي 100%</small>
                  </div>
                  <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-2.5 border border-black/5">
                    <span className="text-[#092012]/70 block text-[10px]">عمولة الإدارة والتحسين (20%)</span>
                    <b className="text-sm font-black tabular-nums text-[#092012]" dir="ltr">
                      ${adMoney.c.toFixed(2)}
                    </b>
                    <small className="text-[9px] text-[#B45309] block font-bold">فريق إعلاني + تقارير</small>
                  </div>
                </div>

                <div className="bg-[#092012]/10 rounded-xl p-2 text-[10px] flex items-center justify-between text-[#092012] font-extrabold">
                  <span>الوصول المقدر: {fmtAr(estReach)} مشاهد يومياً</span>
                  <span>النقرات المقدرة: {fmtAr(estClicks)} نقرة</span>
                </div>
              </div>

              <div className="bg-white rounded-[24px] p-3.5 border border-black/5 space-y-2.5 text-xs shadow-xs">
                <div>
                  <div className="flex justify-between font-extrabold mb-1">
                    <span>الميزانية اليومية الصافية لميتا:</span>
                    <span className="text-[#15803D] tabular-nums" dir="ltr">
                      ${dailyBudget} / يوم
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={50}
                    value={dailyBudget}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setDailyBudget(Number(e.target.value));
                    }}
                    className="w-full accent-[#111D15] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-extrabold mb-1">
                    <span>مدة تشغيل الحملة:</span>
                    <span className="text-[#15803D] tabular-nums">{fmtAr(durationDays)} أيام</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={30}
                    value={durationDays}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setDurationDays(Number(e.target.value));
                    }}
                    className="w-full accent-[#111D15] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-gray-600">سعر الصرف (ل.س / $):</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 bg-[#F1F4F1] rounded-xl px-2.5 py-1 text-left font-mono font-bold text-xs tabular-nums"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------------
                  حاسبة العائد والوصول التقديري ROI (Interactive ROI & Sales Estimator)
                 ------------------------------------------------------------------ */}
              <RoiEstimatorCalculator
                currentDailyBudget={dailyBudget}
                currentDurationDays={durationDays}
                onApplyBudget={(newDaily, newDays) => {
                  setDailyBudget(newDaily);
                  setDurationDays(newDays);
                  showToast(`تم تحديث الميزانية: $${newDaily}/يوم (${newDays} أيام)`);
                }}
                compact={false}
              />

              {/* أزرار الإطلاق بتأثير التوهج الذهبي */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleLaunchCampaign('المحفظة')}
                  className="py-3 px-3 rounded-full gold-glow-btn text-xs font-black active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>خصم وتمويل الحملة (${adMoney.t.toFixed(0)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    setTopupInputUsd(Math.ceil(adMoney.t));
                    setActiveScreen('wallet');
                  }}
                  className="py-3 px-3 rounded-full bg-[#111D15] hover:bg-black text-[#6EE787] font-extrabold text-xs active:scale-95 cursor-pointer transition shadow-md"
                >
                  شحن عبر شام كاش
                </button>
              </div>

              {/* رابط استشارة واتساب مباشر لخبير الحملات */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    openWhatsAppSupport({
                      topic: 'roi',
                      budget: adMoney.b,
                      durationDays,
                      expectedReach: estReach,
                      expectedClicks: estClicks,
                    });
                  }}
                  className="text-[11px] font-bold text-[#15803D] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>تريد استشارة مخصصة لميزانيتك؟ تواصل عبر واتساب (+971558171946)</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              5. الواجهة الداخلية: خزينة البطاقة الافتراضية وشحن شام كاش (3D VAULT & FINANCIAL DASHBOARD)
             ------------------------------------------------------------------ */}
          {activeScreen === 'wallet' && (
            <div className="space-y-3.5">
              {/* بطاقة الخزينة الافتراضية ثلاثية الأبعاد (3D Vault Card) */}
              <Vault3DCard
                balance={walletBalance}
                exchangeRate={exchangeRate}
                userName="محمد مشارقة"
                onQuickTopup={handleQuickTopup}
                onShowToast={showToast}
              />

              {/* قسم الشحن المحلي عبر شام كاش */}
              <div className="bg-white rounded-[24px] p-3.5 border border-black/5 space-y-2.5 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-[#0D1B12]">
                    <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                    <span>شحن الرصيد المحلي (شام كاش):</span>
                  </div>
                  <span className="text-[#15803D] font-mono font-bold text-[11px] tabular-nums" dir="ltr">
                    ${topupInputUsd.toFixed(2)} = {fmtAr(topupInputUsd * exchangeRate)} ل.س
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#F1F4F1] p-2 rounded-xl">
                  <span className="font-bold text-gray-600 text-[11px]">حساب شام كاش المعتمد:</span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('success');
                      navigator.clipboard?.writeText('000000000000');
                      setCopiedShamAcc(true);
                      showToast('تم نسخ رقم حساب شام كاش');
                      setTimeout(() => setCopiedShamAcc(false), 2000);
                    }}
                    dir="ltr"
                    className="px-2.5 py-1 rounded-lg bg-white text-[#0D1B12] font-mono font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer shadow-2xs"
                  >
                    <span>0000 0000 0000</span>
                    {copiedShamAcc ? (
                      <Check className="w-3 h-3 text-[#15803D]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    أدخل رقم عملية التحويل في شام كاش (٦ إلى ١٤ رقماً):
                  </label>
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={shamRefInput}
                    onChange={(e) => setShamRefInput(e.target.value)}
                    placeholder="48392017"
                    className="w-full bg-[#F1F4F1] border border-black/10 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#0D1B12] focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmShamCashTopup}
                  className="w-full py-3 rounded-full gold-glow-btn text-xs font-black active:scale-95 cursor-pointer transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تأكيد الإيداع وإضافة ${topupInputUsd} للمحفظة فوراً</span>
                </button>
              </div>

              {/* ------------------------------------------------------------------
                  سجل الحركات المالية المباشر (Transaction History Log)
                 ------------------------------------------------------------------ */}
              <TransactionHistoryFeed
                transactions={transactions}
                exchangeRate={exchangeRate}
                onShowToast={showToast}
                onLaunchNewCampaign={() => setActiveScreen('campaign')}
              />

              {/* بطاقة دعم مباشر عبر واتساب لعمليات التحويل والشحن */}
              <div className="rounded-[22px] bg-gradient-to-r from-[#091D12] via-[#0F2F1E] to-[#0A2216] text-white p-3.5 border border-[#6EE787]/30 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] grid place-items-center shrink-0">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <b className="text-xs font-black block">تحتاج مساعدة في التحويل المالي؟</b>
                    <span className="text-[10px] text-white/70 block">
                      فريق الدعم المالي متاح عبر واتساب ({YALLA_SUPPORT_PHONE_DISPLAY})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    openWhatsAppSupport({
                      topic: 'topup',
                      budget: topupInputUsd,
                      refCode: shamRefInput || undefined,
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-[#071910] text-[11px] font-black shrink-0 active:scale-95 cursor-pointer transition shadow-xs"
                >
                  تواصل الآن
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              6. الواجهة الداخلية: حساب محمد مشارقة وفريق الدعم (SUPPORT & PROFILE SCREEN)
             ------------------------------------------------------------------ */}
          {activeScreen === 'support' && (
            <div className="space-y-3">
              <div className="rounded-[24px] bg-gradient-to-br from-[#74E386] via-[#99EFA6] to-[#C8FACC] p-3.5 text-[#092012] flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <YallaLogoAvatar
                    size="md"
                    customAvatar={customAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                  />
                  <div>
                    <b className="text-xs font-extrabold block">{userName}</b>
                    <span className="text-[10px] font-bold text-[#092012]/75 block">
                      {metaConnected ? 'حساب ميتا مرتبط ✓' : 'ميتا غير مرتبط'}
                    </span>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    title="تغيير الصورة"
                    className="w-8 h-8 rounded-full bg-white/60 text-[#092012] grid place-items-center active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      setMetaConnected((prev) => !prev);
                      showToast(
                        !metaConnected ? 'تم ربط حساب ميتا بنجاح' : 'تم فصل حساب ميتا'
                      );
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#111D15] text-white text-[10px] font-extrabold active:scale-95 cursor-pointer"
                  >
                    {metaConnected ? 'متصل بميتا' : 'ربط ميتا'}
                  </button>
                </div>
              </div>

              {/* زر واتساب الرسمي المباشر مع رسالة ذكية معدة مسبقاً */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  openWhatsAppSupport({ topic: 'general' });
                }}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white flex items-center justify-between shadow-md active:scale-95 cursor-pointer transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 grid place-items-center">
                    <MessageCircle className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div className="text-right">
                    <b className="text-xs font-black block leading-tight">محادثة واتساب الرسمية المباشرة</b>
                    <span className="text-[10px] text-white/80 font-mono" dir="ltr">
                      {YALLA_SUPPORT_PHONE_DISPLAY}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-black/25 px-2.5 py-1 rounded-full font-bold group-hover:bg-black/35 transition">
                  تواصل عبر واتساب ✦
                </span>
              </button>

              <div className="bg-white rounded-[24px] p-3 border border-black/5 flex flex-col h-48 justify-between">
                <div className="overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {chatMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[86%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
                        m.me
                          ? 'bg-[#111D15] text-white font-bold mr-auto'
                          : 'bg-[#DCFCE7] text-[#092012] font-semibold ml-auto'
                      }`}
                    >
                      {m.t}
                    </div>
                  ))}
                  {isSupportTyping && (
                    <div className="text-[10px] text-[#15803D] font-bold">
                      يكتب مختص الحملات رداً...
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-black/5">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendSupport();
                    }}
                    placeholder="تحدث مع فريق إدارة حملتك..."
                    className="flex-1 bg-[#F1F4F1] rounded-full px-3.5 py-2 text-xs text-[#0D1B12] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendSupport}
                    className="w-9 h-9 rounded-full bg-[#111D15] text-[#6EE787] grid place-items-center active:scale-90 transition cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* شريط التنقل السفلي الدائري الموحد */}
        {renderPhoneBottomDock(activeScreen)}
      </div>
    );
  };

  // ============================================================================
  // RIGHT PHONE: REPORT & ANALYTICS SCREEN
  // ============================================================================
  const activeBars = reportMode === 'income' ? incomeBars : expenseBars;
  const maxBarValue = Math.max(...activeBars, 1);
  const totalReportValue = activeBars.reduce((acc, v) => acc + v, 0);

  const filteredTransactions = transactions.filter(
    (t) =>
      !searchQuery.trim() ||
      t.title.includes(searchQuery.trim()) ||
      t.subtitle.includes(searchQuery.trim())
  );

  const renderScreenThree = () => (
    <div className="w-full max-w-[385px] h-[800px] rounded-[44px] bg-[#FFFFFF] text-[#0D1B12] flex flex-col justify-between relative overflow-hidden shadow-[0_28px_70px_rgba(0,0,0,0.55)] border border-black/10 mx-auto">
      <div className="p-6 pb-3 flex-1 overflow-y-auto no-scrollbar space-y-4">
        <div
          className="flex items-center justify-between text-[#0D1B12] text-xs font-bold px-1"
          dir="ltr"
        >
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-2.5 border border-[#0D1B12] rounded-[2px] relative">
              <span className="absolute inset-0.5 bg-[#0D1B12]" />
            </span>
            <span className="text-[10px] font-extrabold">5G</span>
          </div>
        </div>

        {/* هيدر التقارير مع أزرار البحث والتقويم */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <YallaLogoAvatar size="sm" customAvatar={customAvatar} />
            <h2 className="text-xl font-extrabold text-[#0D1B12]">التقارير والأداء</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowSearchInput((prev) => !prev);
              }}
              aria-label="بحث في الحركات"
              className="w-9 h-9 rounded-full border border-black/10 grid place-items-center text-[#0D1B12] hover:bg-black/5 active:scale-95 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                showToast('تم تحديث إحصائيات محمد مشارقة لآخر ٦ أشهر');
              }}
              aria-label="الفترة الزمنية"
              className="w-9 h-9 rounded-full border border-black/10 grid place-items-center text-[#0D1B12] hover:bg-black/5 active:scale-95 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showSearchInput && (
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في حركات محمد مشارقة..."
            className="w-full bg-[#F2F5F2] border border-black/10 rounded-full px-4 py-2 text-xs text-[#0D1B12] focus:outline-none"
          />
        )}

        {/* مفتاح التبديل المزدوج */}
        <div className="bg-[#F1F4F1] p-1 rounded-full grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setReportMode('income');
            }}
            className={`py-2.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
              reportMode === 'income'
                ? 'bg-[#141E17] text-white shadow-sm'
                : 'text-[#526356] hover:text-[#0D1B12]'
            }`}
          >
            الرصيد والعائد
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setReportMode('expense');
            }}
            className={`py-2.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
              reportMode === 'expense'
                ? 'bg-[#141E17] text-white shadow-sm'
                : 'text-[#526356] hover:text-[#0D1B12]'
            }`}
          >
            مصروف الإعلانات
          </button>
        </div>

        {/* بطاقة الرسم البياني الخضراء المخططة */}
        <div className="rounded-[30px] bg-gradient-to-br from-[#6EE787] via-[#86EFAC] to-[#B8F5BE] p-5 text-[#092012] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-[#092012]/75 block">
                {reportMode === 'income' ? 'إجمالي رصيد المحفظة الحالي' : 'إجمالي تمويل ميتا'}
              </span>
              <b
                dir="ltr"
                className="text-2xl font-extrabold text-[#092012] tabular-nums block mt-0.5"
              >
                $ {reportMode === 'income' ? walletBalance.toFixed(2) : totalReportValue.toFixed(2)}
              </b>
            </div>
            <span
              dir="ltr"
              className="px-3 py-1 rounded-full border border-[#092012]/40 text-xs font-extrabold tabular-nums"
            >
              ↗ {reportMode === 'income' ? '16%' : '9%'}
            </span>
          </div>

          <div className="mt-8 pt-4 flex items-end justify-between gap-2.5 h-44 px-1" dir="ltr">
            <div className="flex flex-col justify-between h-full text-[10px] font-bold text-[#092012]/65 pb-6 pr-1 tabular-nums">
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
            </div>

            {activeBars.map((val, idx) => {
              const heightPct = Math.max(28, Math.round((val / maxBarValue) * 100));
              const isSelected = idx === selectedBarIdx;
              return (
                <div
                  key={chartMonths[idx]}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedBarIdx(idx);
                  }}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                >
                  {isSelected && (
                    <div className="absolute -top-8 bg-[#18221B] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md tabular-nums whitespace-nowrap">
                      ${fmt(val)}
                    </div>
                  )}

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[34px] rounded-t-[16px] rounded-b-[6px] transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#1B261E] shadow-md'
                        : 'bar-hatched border border-[#092012]/15 group-hover:opacity-85'
                    }`}
                  />
                  <span
                    className={`text-[10px] mt-2 font-bold ${
                      isSelected ? 'text-[#092012] font-extrabold' : 'text-[#092012]/70'
                    }`}
                  >
                    {chartMonths[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* شريط بطاقة بوتيم الدولية الداكن */}
        <div
          onClick={() => navigateToScreen('campaign')}
          className="rounded-[22px] bg-gradient-to-r from-[#091D12] via-[#133321] to-[#0D2618] text-white p-3.5 px-4 flex items-center justify-between shadow-md cursor-pointer hover:brightness-110 active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-[#6EE787] to-[#34D399] p-1 flex flex-col justify-between text-[#092012] shrink-0">
              <span className="w-2.5 h-1.5 rounded-xs bg-[#FDE047]" />
              <span className="text-[7px] font-black tracking-tighter" dir="ltr">
                BOTIM
              </span>
            </div>
            <div>
              <b className="text-xs font-extrabold block">بطاقة تمويل ميتا الدولية</b>
              <span className="text-[10px] text-white/70 block">
                إطلاق حملة جديدة من رصيدك ($360)
              </span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full border border-white/25 grid place-items-center text-white shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>

        {/* قائمة الحركات المالية الأخيرة */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold text-[#0D1B12]">أحدث الحركات المالية</h3>
            <button
              type="button"
              onClick={() => navigateToScreen('wallet')}
              className="text-[11px] font-bold text-[#15803D] hover:underline cursor-pointer"
            >
              + شحن شام كاش
            </button>
          </div>

          <div className="space-y-2">
            {filteredTransactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                onClick={() => navigateToScreen('wallet')}
                className="flex items-center justify-between py-2 px-2.5 rounded-2xl hover:bg-[#F4F7F4] active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full ${tx.badgeBg} font-extrabold text-xs grid place-items-center shrink-0`}
                  >
                    {tx.initials}
                  </div>
                  <div className="min-w-0">
                    <b className="text-xs font-extrabold text-[#0D1B12] block truncate">
                      {tx.title}
                    </b>
                    <span className="text-[10px] text-[#607064] block truncate">
                      {tx.subtitle}
                    </span>
                  </div>
                </div>
                <span
                  dir="ltr"
                  className={`text-xs font-extrabold tabular-nums shrink-0 ${
                    tx.isPositive ? 'text-[#15803D]' : 'text-[#607064]'
                  }`}
                >
                  {tx.isPositive ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderPhoneBottomDock('report')}
    </div>
  );

  return (
    <div className="min-h-screen studio-backdrop text-[#0D1B12] flex flex-col justify-between relative overflow-x-hidden">
      {/* الهيدر العلوي للاستوديو */}
      <header className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 pt-5 pb-2 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <YallaLogoAvatar size="md" customAvatar={customAvatar} />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#092012] tracking-tight leading-none">
              يلا إعلان — Yalla Ads
            </h1>
            <p className="text-xs font-bold text-[#1E3F29] mt-1">
              مرحباً {userName} · الرصيد المتاح: ${walletBalance.toFixed(2)} · استجابة لمسية وخرائط تفاعلية
            </p>
          </div>
        </div>

        {/* شريط التبديل السريع بين الواجهات الداخلية ووضع العرض */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#092012]/10 p-1 rounded-full border border-[#092012]/15 overflow-x-auto no-scrollbar">
            {[
              { id: 'home', label: 'الرئيسية' },
              { id: 'campaign', label: 'حملة ذكية ✦' },
              { id: 'targeting', label: 'خريطة سوريا' },
              { id: 'budget', label: 'تمويل ميتا' },
              { id: 'wallet', label: 'شحن شام كاش' },
              { id: 'support', label: 'فريق الإدارة' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigateToScreen(tab.id as InternalScreen, 'light')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                  activeScreen === tab.id
                    ? 'bg-[#092012] text-[#6EE787] shadow-xs'
                    : 'text-[#092012] hover:bg-white/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center bg-[#092012]/10 p-1 rounded-full border border-[#092012]/15">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setStudioMode(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition cursor-pointer ${
                studioMode ? 'bg-[#092012] text-[#6EE787]' : 'text-[#092012]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>٣ شاشات</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setStudioMode(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition cursor-pointer ${
                !studioMode ? 'bg-[#092012] text-[#6EE787]' : 'text-[#092012]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>شاشة منفردة</span>
            </button>
          </div>
        </div>
      </header>

      {/* منطقة العرض الرئيسية */}
      <main className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 py-4 pb-10 flex-1 flex items-center justify-center z-10">
        <div
          className={`${
            studioMode ? 'hidden xl:grid xl:grid-cols-3 gap-7 items-center w-full' : 'hidden'
          }`}
        >
          {renderScreenOne()}
          {renderCenterInteractivePhone()}
          {renderScreenThree()}
        </div>

        <div className={`${studioMode ? 'xl:hidden w-full' : 'w-full'}`}>
          {renderCenterInteractivePhone()}
        </div>
      </main>

      {/* نافذة الاحتفال الفاخرة بإطلاق الحملة وتخصيص بطاقة بوتيم */}
      <CampaignCelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        onViewReports={() => {
          setCelebrationData((prev) => ({ ...prev, isOpen: false }));
          setActiveScreen('report');
        }}
        campaignTitle={celebrationData.title}
        totalBudget={celebrationData.totalBudget}
        botimAllocated={celebrationData.botimAllocated}
        estDailyReach={celebrationData.reach}
        targetLocations={celebrationData.locations}
      />

      {/* تأثير الجسيمات الذهبية المتساقطة واحتفال شحن المحفظة بنجاح */}
      <WalletCelebrationModal
        isOpen={walletCelebrationData.isOpen}
        onClose={() => setWalletCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        onGoToCampaign={() => {
          setWalletCelebrationData((prev) => ({ ...prev, isOpen: false }));
          setActiveScreen('campaign');
        }}
        amountUsd={walletCelebrationData.amountUsd}
        newBalance={walletCelebrationData.newBalance}
        referenceNumber={walletCelebrationData.referenceNumber}
        exchangeRate={exchangeRate}
        methodName={walletCelebrationData.methodName}
      />

      {/* رسائل التنبيه الفورية (Toast) */}
      <div
        role="status"
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#092012] text-[#6EE787] border border-[#6EE787]/50 px-5 py-2.5 rounded-full font-extrabold text-xs shadow-2xl transition-all duration-300 pointer-events-none ${
          toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
        }`}
      >
        {toastMsg}
      </div>
    </div>
  );
}
