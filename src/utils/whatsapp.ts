/**
 * WhatsApp Support Integration for Yalla Ads (يلا إعلان)
 * Direct official contact: +971558171946
 */

export const YALLA_SUPPORT_PHONE = '971558171946';
export const YALLA_SUPPORT_PHONE_DISPLAY = '+971 55 817 1946';

export type WhatsAppInquiryTopic =
  | 'general'
  | 'campaign'
  | 'roi'
  | 'topup'
  | 'targeting';

interface WhatsAppLinkOptions {
  topic?: WhatsAppInquiryTopic;
  campaignTitle?: string;
  budget?: number;
  durationDays?: number;
  expectedReach?: number;
  expectedClicks?: number;
  refCode?: string;
}

export function buildWhatsAppSupportUrl(options: WhatsAppLinkOptions = {}): string {
  const {
    topic = 'general',
    campaignTitle,
    budget,
    durationDays,
    expectedReach,
    expectedClicks,
    refCode,
  } = options;

  let message = 'مرحباً فريق يلا إعلان 👋 أرغب باستشارة فريق إدارة الحملات حول إعلانات ميتا الممولة في سوريا.';

  switch (topic) {
    case 'roi':
      message = `مرحباً فريق يلا إعلان 👋 قمت بحساب تقديرات العائد (ROI) لميزانية $${budget || 50} لمدة ${durationDays || 7} أيام (الوصول المتوقع: ${expectedReach?.toLocaleString('ar-EG') || '—'} مشاهدة). أرغب بمراجعة الخطة مع خبير الحملات قبل الإطلاق.`;
      break;

    case 'topup':
      message = `مرحباً فريق يلا إعلان 👋 أحتاج مساعدة بخصوص شحن رصيد المحفظة عبر شام كاش وتغذية بطاقة بوتيم الدولية${
        refCode ? ` (رقم الإشعار: #${refCode})` : ''
      }.`;
      break;

    case 'campaign':
      message = `مرحباً فريق يلا إعلان 👋 أود الاستفسار ومتابعة حالة حملتي الإعلانية${
        campaignTitle ? `: "${campaignTitle}"` : ''
      } لتحسين نسبة التحويل والمبيعات.`;
      break;

    case 'targeting':
      message = 'مرحباً فريق يلا إعلان 👋 أرغب باستشارة مختص الحملات حول الاستهداف الجغرافي الدقيق للمحافظات والأحياء في سوريا.';
      break;

    case 'general':
    default:
      message = 'مرحباً فريق إدارة الحملات في يلا إعلان 👋 أحتاج مساعدة واستشارة إعلانية سريعة لحسابي التجاري.';
      break;
  }

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${YALLA_SUPPORT_PHONE}?text=${encoded}`;
}

export function openWhatsAppSupport(options: WhatsAppLinkOptions = {}) {
  const url = buildWhatsAppSupportUrl(options);
  // Safe navigation in iframes without window.open popup blockers
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
