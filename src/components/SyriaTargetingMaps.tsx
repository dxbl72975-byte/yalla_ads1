import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Users,
  Crosshair,
  Check,
  Sparkles,
  Radio,
  Signal,
  Layers,
  ArrowLeft,
  Search,
  Sliders,
  Trash2,
  Compass,
  Building2,
  Store,
  LocateFixed,
  Eye,
  Info,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export interface GovernorateData {
  name: string;
  cx: number;
  cy: number;
  lat: number;
  lng: number;
  defaultZoom: number;
  weight: number;
  audience: string;
  audienceNum: number; // in thousands
  region: 'south' | 'central' | 'coast' | 'north' | 'east';
  labelOffset?: [number, number];
  polygonPath?: string;
  keyCities: string[];
}

export interface PrecisionSpot {
  nm: string;
  k: string;
  r: number; // radius in meters
  x: number; // legacy coordinate fallback
  y: number; // legacy coordinate fallback
  lat?: number; // GPS Latitude
  lng?: number; // GPS Longitude
  city?: string;
  address?: string;
}

// 14 Syrian Governorates with Real World WGS84 GPS Coordinates
export const SYRIA_GOVERNORATES: GovernorateData[] = [
  {
    name: 'دمشق',
    cx: 112,
    cy: 238,
    lat: 33.5138,
    lng: 36.2765,
    defaultZoom: 13,
    weight: 2.4,
    audience: '1.45M',
    audienceNum: 1450,
    region: 'south',
    labelOffset: [0, -13],
    polygonPath: 'M104,230 L122,228 L126,246 L106,247 Z',
    keyCities: ['الشعلان', 'أبو رمانة', 'المزة', 'المالكي', 'الميدان', 'الصالحية', 'كفرسوسة'],
  },
  {
    name: 'ريف دمشق',
    cx: 144,
    cy: 220,
    lat: 33.535,
    lng: 36.38,
    defaultZoom: 11,
    weight: 2.0,
    audience: '1.15M',
    audienceNum: 1150,
    region: 'south',
    labelOffset: [12, -11],
    polygonPath: 'M88,206 L134,198 L188,212 L206,242 L164,266 L122,260 L104,248 L90,222 Z',
    keyCities: ['جرمانا', 'صحنايا', 'الكسوة', 'دوما', 'قدسيا', 'النبك', 'يبرود'],
  },
  {
    name: 'حلب',
    cx: 162,
    cy: 64,
    lat: 36.2021,
    lng: 37.1343,
    defaultZoom: 13,
    weight: 2.1,
    audience: '1.35M',
    audienceNum: 1350,
    region: 'north',
    labelOffset: [0, -13],
    polygonPath: 'M126,38 L168,28 L225,30 L220,84 L172,96 L130,76 Z',
    keyCities: ['الجميلية', 'موكامبو', 'الفرقان', 'الشهباء', 'سيف الدولة', 'شارع النيل'],
  },
  {
    name: 'حمص',
    cx: 168,
    cy: 168,
    lat: 34.7324,
    lng: 36.7137,
    defaultZoom: 13,
    weight: 1.1,
    audience: '780K',
    audienceNum: 780,
    region: 'central',
    labelOffset: [0, -13],
    polygonPath: 'M84,166 L136,156 L195,152 L292,216 L225,256 L188,212 L134,198 L88,206 Z',
    keyCities: ['الدبلان', 'شارع الحضارة', 'الإنشاءات', 'كرم الشامي', 'تدمر', 'القصير'],
  },
  {
    name: 'حماة',
    cx: 145,
    cy: 128,
    lat: 35.1318,
    lng: 36.7578,
    defaultZoom: 13,
    weight: 0.9,
    audience: '640K',
    audienceNum: 640,
    region: 'central',
    labelOffset: [0, -12],
    polygonPath: 'M108,116 L148,110 L195,152 L136,156 L96,144 Z',
    keyCities: ['ساحة العاصي', 'الحاضر', 'الشريعة', 'طريق حلب', 'سلمية', 'مصياف'],
  },
  {
    name: 'اللاذقية',
    cx: 74,
    cy: 112,
    lat: 35.5317,
    lng: 35.7901,
    defaultZoom: 13,
    weight: 0.9,
    audience: '690K',
    audienceNum: 690,
    region: 'coast',
    labelOffset: [-6, -12],
    polygonPath: 'M68,82 L98,88 L96,134 L64,118 Z',
    keyCities: ['الكورنيش الجنوبي', 'الكورنيش الغربي', 'شارع الأميركان', 'الزراعة', 'جبلة'],
  },
  {
    name: 'طرطوس',
    cx: 80,
    cy: 154,
    lat: 34.889,
    lng: 35.8866,
    defaultZoom: 13,
    weight: 0.5,
    audience: '460K',
    audienceNum: 460,
    region: 'coast',
    labelOffset: [-8, -11],
    polygonPath: 'M64,118 L96,134 L94,168 L72,166 Z',
    keyCities: ['الكورنيش البحري', 'المينا', 'شارع الثورة', 'بانياس', 'صافيتا'],
  },
  {
    name: 'إدلب',
    cx: 118,
    cy: 78,
    lat: 35.9306,
    lng: 36.6339,
    defaultZoom: 13,
    weight: 0.7,
    audience: '520K',
    audienceNum: 520,
    region: 'north',
    labelOffset: [0, -12],
    polygonPath: 'M98,88 L126,38 L130,76 L148,110 L108,116 Z',
    keyCities: ['مركز المدينة', 'سرمدا', 'الدانا', 'أريحا', 'معرة النعمان', 'سلقين'],
  },
  {
    name: 'الرقة',
    cx: 246,
    cy: 92,
    lat: 35.9594,
    lng: 39.0089,
    defaultZoom: 13,
    weight: 0.5,
    audience: '340K',
    audienceNum: 340,
    region: 'east',
    labelOffset: [0, -12],
    polygonPath: 'M225,30 L288,36 L298,90 L242,126 L220,84 Z',
    keyCities: ['شارع تل أبيض', 'الساعة', 'شارع المنصور', 'الطبقة', 'الثورة'],
  },
  {
    name: 'دير الزور',
    cx: 332,
    cy: 142,
    lat: 35.3359,
    lng: 40.1408,
    defaultZoom: 13,
    weight: 0.7,
    audience: '410K',
    audienceNum: 410,
    region: 'east',
    labelOffset: [0, -12],
    polygonPath: 'M242,126 L298,90 L386,98 L378,136 L352,175 L292,216 L195,152 Z',
    keyCities: ['الجسر المعلق', 'شارع ستة إلا ربع', 'حي الرشدية', 'الميادين', 'البوكمال'],
  },
  {
    name: 'الحسكة',
    cx: 368,
    cy: 56,
    lat: 36.5023,
    lng: 40.7483,
    defaultZoom: 13,
    weight: 0.6,
    audience: '450K',
    audienceNum: 450,
    region: 'east',
    labelOffset: [0, -12],
    polygonPath: 'M288,36 L348,26 L404,34 L412,52 L386,98 L298,90 Z',
    keyCities: ['القامشلي', 'شارع القوتلي', 'سوق الصاغة', 'رأس العين', 'المالكية', 'عامودا'],
  },
  {
    name: 'درعا',
    cx: 106,
    cy: 280,
    lat: 32.6255,
    lng: 36.1055,
    defaultZoom: 13,
    weight: 0.6,
    audience: '430K',
    audienceNum: 430,
    region: 'south',
    labelOffset: [0, 18],
    polygonPath: 'M94,268 L124,264 L122,298 L94,288 Z',
    keyCities: ['درعا المحطة', 'درعا البلد', 'ساحة بصرى', 'إزرع', 'الصنمين', 'نوى'],
  },
  {
    name: 'السويداء',
    cx: 146,
    cy: 276,
    lat: 32.709,
    lng: 36.5695,
    defaultZoom: 13,
    weight: 0.4,
    audience: '310K',
    audienceNum: 310,
    region: 'south',
    labelOffset: [0, 18],
    polygonPath: 'M124,264 L164,266 L176,294 L122,298 Z',
    keyCities: ['ساحة السير', 'طريق قنوات', 'مساكن الخضر', 'شهبا', 'صلخد'],
  },
  {
    name: 'القنيطرة',
    cx: 78,
    cy: 264,
    lat: 33.1264,
    lng: 35.8246,
    defaultZoom: 13,
    weight: 0.2,
    audience: '140K',
    audienceNum: 140,
    region: 'south',
    labelOffset: [-8, 16],
    polygonPath: 'M74,268 L94,268 L94,288 L74,268 Z',
    keyCities: ['مدينة البعث', 'خان أرنبة', 'جبا', 'مجدل شمس'],
  },
];

// Famous Syrian Commercial Hotspots & Neighborhood Presets with Real Lat/Lng
const SYRIAN_LOCAL_HOTSPOTS = [
  {
    nm: 'المزة — أوتوستراد والشيخ سعد',
    city: 'دمشق',
    k: 'شارع تجاري',
    lat: 33.4985,
    lng: 36.246,
    r: 1200,
  },
  {
    nm: 'الشعلان والصالحية',
    city: 'دمشق',
    k: 'سوق وأزياء',
    lat: 33.5186,
    lng: 36.2917,
    r: 800,
  },
  {
    nm: 'أبو رمانة والمالكي',
    city: 'دمشق',
    k: 'حي راقي ومطاعم',
    lat: 33.5228,
    lng: 36.2842,
    r: 1000,
  },
  {
    nm: 'باب توما والمدينة القديمة',
    city: 'دمشق',
    k: 'سياحة ومطاعم',
    lat: 33.5115,
    lng: 36.316,
    r: 700,
  },
  {
    nm: 'كفرسوسة — الشام سيتي سنتر',
    city: 'دمشق',
    k: 'مول وشركات',
    lat: 33.492,
    lng: 36.275,
    r: 1000,
  },
  {
    nm: 'جرمانا — ساحة السيوف',
    city: 'ريف دمشق',
    k: 'سوق مكتظ',
    lat: 33.4835,
    lng: 36.346,
    r: 1500,
  },
  {
    nm: 'الجميلية وموكامبو',
    city: 'حلب',
    k: 'سوق ومتاجر',
    lat: 36.2085,
    lng: 37.1425,
    r: 1200,
  },
  {
    nm: 'الشهباء والفرقان',
    city: 'حلب',
    k: 'مطاعم وأحياء راقية',
    lat: 36.216,
    lng: 37.118,
    r: 1200,
  },
  {
    nm: 'الدبلان وشارع الحضارة',
    city: 'حمص',
    k: 'مركز تجاري',
    lat: 34.729,
    lng: 36.708,
    r: 1000,
  },
  {
    nm: 'الكورنيش والزراعة',
    city: 'اللاذقية',
    k: 'كورنيش وأسواق',
    lat: 35.526,
    lng: 35.782,
    r: 1200,
  },
  {
    nm: 'شارع الأميركان والأزهري',
    city: 'اللاذقية',
    k: 'مقاهي ومتاجر',
    lat: 35.534,
    lng: 35.795,
    r: 900,
  },
  {
    nm: 'الكورنيش البحري والمينا',
    city: 'طرطوس',
    k: 'مطاعم وسياحة',
    lat: 34.892,
    lng: 35.882,
    r: 1000,
  },
  {
    nm: 'سرمدا — سوق الهال والتجارة',
    city: 'إدلب',
    k: 'سوق تجاري حيوي',
    lat: 36.183,
    lng: 36.718,
    r: 1500,
  },
  {
    nm: 'شارع القوتلي والصاغة',
    city: 'الحسكة',
    k: 'سوق مركزي',
    lat: 36.502,
    lng: 40.751,
    r: 900,
  },
];

// Leaflet Tile Layer Choices
type TileTheme = 'dark' | 'osm' | 'satellite';

const TILE_LAYERS: Record<TileTheme, { url: string; label: string; subdomains?: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    label: 'زمردي ليلي (CartoDB)',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    label: 'شوارع ومحلات (OpenStreetMap)',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    label: 'أقمار صناعية (Satellite HD)',
    maxZoom: 18,
  },
};

interface SyriaTargetingMapsProps {
  zoneTab: 'g' | 'p';
  setZoneTab: (tab: 'g' | 'p') => void;
  selectedProvs: string[];
  setSelectedProvs: React.Dispatch<React.SetStateAction<string[]>>;
  spots: PrecisionSpot[];
  setSpots: React.Dispatch<React.SetStateAction<PrecisionSpot[]>>;
  estReach: number;
  onNext: () => void;
  onShowToast: (msg: string) => void;
}

const fmtAr = (n: number) => Math.round(n).toLocaleString('ar-EG');

export const SyriaTargetingMaps: React.FC<SyriaTargetingMapsProps> = ({
  zoneTab,
  setZoneTab,
  selectedProvs,
  setSelectedProvs,
  spots,
  setSpots,
  estReach,
  onNext,
  onShowToast,
}) => {
  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);
  const provCirclesGroupRef = useRef<L.LayerGroup | null>(null);

  // Map state
  const [tileTheme, setTileTheme] = useState<TileTheme>('dark');
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [activeCenter, setActiveCenter] = useState<{ lat: number; lng: number }>({
    lat: 33.5138,
    lng: 36.2765,
  });

  // Tracking interactive Leaflet circles for smooth real-time expansion & contraction
  const circlesMapRef = useRef<Map<number, L.Circle>>(new Map());
  const previewCircleRef = useRef<L.Circle | null>(null);
  const [selectedSpotIdx, setSelectedSpotIdx] = useState<number | null>(0);

  // Targeting controls
  const [spotName, setSpotName] = useState<string>('');
  const [spotKind, setSpotKind] = useState<string>('محل / متجر');
  const [spotRadius, setSpotRadius] = useState<number>(1000); // meters
  const [selectedCityContext, setSelectedCityContext] = useState<string>('دمشق');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string; type?: string }>
  >([]);

  // Active hover/selected governorate info
  const [activeGovInfo, setActiveGovInfo] = useState<GovernorateData>(SYRIA_GOVERNORATES[0]);

  // Total Audience in selected governorates
  const totalAudienceInSelected = selectedProvs.reduce((acc, provName) => {
    const gov = SYRIA_GOVERNORATES.find((g) => g.name === provName);
    return acc + (gov ? gov.audienceNum : 0);
  }, 0);

  const coveragePercent = Math.round((selectedProvs.length / SYRIA_GOVERNORATES.length) * 100);

  // تصحيح تفاعلي: توسيع وتصغير المسار/الدائرة على الخريطة مباشرة مع حركة شريط التمرير
  const handleRadiusChange = (newRadius: number) => {
    setSpotRadius(newRadius);

    if (spots.length > 0) {
      const activeIdx =
        selectedSpotIdx !== null && selectedSpotIdx < spots.length
          ? selectedSpotIdx
          : spots.length - 1;

      // 1. تحديث فوري مباشر لدائرة Leaflet بالحركة السلسة على الخريطة
      const activeCircle = circlesMapRef.current.get(activeIdx);
      if (activeCircle) {
        activeCircle.setRadius(newRadius);
      }

      // 2. مزامنة الحالة مع بيانات الحملة الإعلانية
      setSpots((prev) =>
        prev.map((s, idx) => (idx === activeIdx ? { ...s, r: newRadius } : s))
      );
    } else if (previewCircleRef.current) {
      previewCircleRef.current.setRadius(newRadius);
    }
  };

  // --------------------------------------------------------------------------
  // 1. Initialize Real Leaflet Map
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    // Center on Damascus by default or first selected province
    const initialGov =
      SYRIA_GOVERNORATES.find((g) => g.name === selectedProvs[0]) || SYRIA_GOVERNORATES[0];

    const map = L.map(mapContainerRef.current, {
      center: [initialGov.lat, initialGov.lng],
      zoom: initialGov.defaultZoom,
      zoomControl: false, // Custom luxury controls rendered in React
      attributionControl: false,
      minZoom: 6,
      maxZoom: 19,
    });

    // Add Initial Tile Layer
    const tileConf = TILE_LAYERS[tileTheme];
    const tileLayer = L.tileLayer(tileConf.url, {
      maxZoom: tileConf.maxZoom,
      subdomains: tileConf.subdomains || 'abc',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups for markers, radius circles, and governorate polygons
    const circlesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const provCirclesGroup = L.layerGroup().addTo(map);

    circlesGroupRef.current = circlesGroup;
    markersGroupRef.current = markersGroup;
    provCirclesGroupRef.current = provCirclesGroup;

    // Track map zoom & move
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });
    map.on('moveend', () => {
      const c = map.getCenter();
      setActiveCenter({ lat: Number(c.lat.toFixed(4)), lng: Number(c.lng.toFixed(4)) });
    });

    // Map Click Listener to Drop Custom Pins
    map.on('click', async (e: L.LeafletMouseEvent) => {
      triggerHaptic('medium');
      const lat = Number(e.latlng.lat.toFixed(5));
      const lng = Number(e.latlng.lng.toFixed(5));

      // Attempt reverse geocoding via OpenStreetMap Nominatim
      let detectedName = '';
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1&accept-language=ar`,
          { headers: { 'Accept-Language': 'ar' } }
        );
        const data = await resp.json();
        if (data && data.address) {
          const street =
            data.address.road ||
            data.address.suburb ||
            data.address.neighbourhood ||
            data.address.quarter ||
            data.address.commercial ||
            data.address.amenity;
          const city =
            data.address.city ||
            data.address.town ||
            data.address.state ||
            data.address.county ||
            'سوريا';
          if (street) {
            detectedName = `${street} — ${city}`;
          }
        }
      } catch {
        // fallback silently
      }

      const finalName =
        spotName.trim() ||
        detectedName ||
        `${spotKind} (${lat.toFixed(3)}, ${lng.toFixed(3)})`;

      setSpots((prev) => [
        ...prev,
        {
          nm: finalName,
          k: spotKind,
          r: spotRadius,
          x: Math.round(lng * 10), // backward compat
          y: Math.round(lat * 10), // backward compat
          lat,
          lng,
          city: selectedCityContext,
          address: detectedName,
        },
      ]);

      setSpotName('');
      onShowToast(`تم تثبيت دبوس استهداف دقيق: ${finalName} (نطاق ${fmtAr(spotRadius)}م)`);
    });

    mapRef.current = map;

    // Force map relayout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. Switch Map Tile Themes (Dark Emerald vs OSM vs Satellite)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConf = TILE_LAYERS[tileTheme];
    const newTileLayer = L.tileLayer(tileConf.url, {
      maxZoom: tileConf.maxZoom,
      subdomains: tileConf.subdomains || 'abc',
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    onShowToast(`تم تفعيل نمط: ${tileConf.label}`);
  }, [tileTheme]);

  // --------------------------------------------------------------------------
  // 3. Render Custom Pins & Interactive Radius Circles on the Leaflet Map
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current || !circlesGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    circlesGroupRef.current.clearLayers();
    circlesMapRef.current.clear();
    previewCircleRef.current = null;

    if (spots.length === 0) {
      // دائرة معاينة رادارية تفاعلية تتوسع وتصغر فوراً مع حركة شريط التمرير
      const previewCircle = L.circle([activeCenter.lat, activeCenter.lng], {
        radius: spotRadius,
        color: '#FDE047',
        fillColor: '#6EE787',
        fillOpacity: 0.25,
        weight: 2.5,
        dashArray: '6, 4',
      });
      previewCircle.bindTooltip('نطاق الرادار التفاعلي — اسحب الشريط للتوسيع والتصغير', {
        permanent: false,
        direction: 'top',
        className: 'bg-[#071910] text-[#FDE047] border border-[#FDE047]/40 text-xs rounded-xl p-1',
      });
      circlesGroupRef.current.addLayer(previewCircle);
      previewCircleRef.current = previewCircle;
      return;
    }

    spots.forEach((spot, idx) => {
      // Default to Damascus if no GPS coords yet
      const lat = spot.lat ?? (33.5138 + (spot.y - 100) * 0.001);
      const lng = spot.lng ?? (36.2765 + (spot.x - 100) * 0.001);
      const radiusMeters = spot.r;

      const isSelectedSpot =
        selectedSpotIdx === idx || (selectedSpotIdx === null && idx === spots.length - 1);

      // 1. Draw Target Radius Circle with interactive expansion/shrinkage
      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: isSelectedSpot ? '#FDE047' : '#6EE787',
        fillColor: isSelectedSpot ? '#6EE787' : '#6EE787',
        fillOpacity: isSelectedSpot ? 0.32 : 0.18,
        weight: isSelectedSpot ? 3.2 : 1.8,
        dashArray: isSelectedSpot ? '7, 4' : '5, 4',
      });

      circle.on('click', () => {
        triggerHaptic('light');
        setSelectedSpotIdx(idx);
        setSpotRadius(spot.r);
        onShowToast(`تم تحديد مسار: ${spot.nm} (${fmtAr(spot.r)}م)`);
      });

      circlesGroupRef.current?.addLayer(circle);
      circlesMapRef.current.set(idx, circle);

      // 2. Custom Luxury HTML Marker (No broken images, pure CSS & SVG)
      const customIcon = L.divIcon({
        className: 'leaflet-custom-marker-wrapper',
        html: `
          <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
            <div class="leaflet-pin-pulse" style="position:absolute; width:36px; height:36px; border-radius:50%; background:${
              isSelectedSpot ? 'rgba(253, 224, 71, 0.5)' : 'rgba(110, 231, 135, 0.45)'
            }; border:1.5px solid ${isSelectedSpot ? '#FDE047' : '#6EE787'};"></div>
            <div style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg, ${
              isSelectedSpot ? '#2F2611' : '#112F20'
            }, #071910); border:2.5px solid ${
          isSelectedSpot ? '#FDE047' : '#6EE787'
        }; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(0,0,0,0.7); color:${
          isSelectedSpot ? '#FDE047' : '#6EE787'
        }; font-weight:900; font-size:12px; font-family:'Cairo',sans-serif;">
              ${idx + 1}
            </div>
            <div style="position:absolute; top:-20px; white-space:nowrap; background:#071910; color:${
              isSelectedSpot ? '#FDE047' : '#FFFFFF'
            }; border:1px solid ${
          isSelectedSpot ? '#FDE047' : '#6EE787'
        }; border-radius:10px; font-size:9px; font-weight:800; padding:1px 6px; box-shadow:0 3px 8px rgba(0,0,0,0.5);">
              ${spot.nm.slice(0, 14)}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        triggerHaptic('light');
        setSelectedSpotIdx(idx);
        setSpotRadius(spot.r);
      });

      // Create Sleek Dark Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.dir = 'rtl';
      popupDiv.className = 'text-right space-y-1.5 p-1';
      popupDiv.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:6px; margin-bottom:6px;">
          <b style="color:#6EE787; font-size:12px; font-family:'Cairo'; font-weight:800;">📍 ${spot.nm}</b>
          <span style="background:#112F20; color:#86EFAC; font-size:9px; padding:2px 6px; border-radius:8px; font-weight:700;">${spot.k}</span>
        </div>
        <div style="font-size:10px; color:#E2ECE6; line-height:1.5; font-family:'Cairo';">
          <div>🌐 <b>إحداثيات:</b> <span dir="ltr">${lat.toFixed(4)}°, ${lng.toFixed(4)}°</span></div>
          <div>🎯 <b>نصف القطر:</b> <span style="color:#6EE787; font-weight:800;">${fmtAr(radiusMeters)} متر</span></div>
          <div>👥 <b>وصول ميتا المتوقع:</b> <span style="color:#86EFAC; font-weight:800;">${fmtAr(radiusMeters * 3.5)} مستخدم</span></div>
        </div>
      `;

      // Add delete button inside popup
      const delBtn = document.createElement('button');
      delBtn.className =
        'w-full mt-2 py-1 px-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 text-[10px] font-bold border border-red-500/40 cursor-pointer flex items-center justify-center gap-1';
      delBtn.innerHTML = '🗑️ حذف نقطة الاستهداف هذه';
      delBtn.onclick = () => {
        triggerHaptic('medium');
        setSpots((prev) => prev.filter((_, i) => i !== idx));
        if (selectedSpotIdx === idx) setSelectedSpotIdx(null);
        onShowToast(`تم حذف دبوس: ${spot.nm}`);
        mapRef.current?.closePopup();
      };
      popupDiv.appendChild(delBtn);

      marker.bindPopup(popupDiv);
      markersGroupRef.current?.addLayer(marker);
    });
  }, [spots, selectedSpotIdx]);

  // --------------------------------------------------------------------------
  // 4. Render Selected Governorates Coverage Highlights on Map
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current || !provCirclesGroupRef.current) return;
    provCirclesGroupRef.current.clearLayers();

    selectedProvs.forEach((provName) => {
      const gov = SYRIA_GOVERNORATES.find((g) => g.name === provName);
      if (!gov) return;

      // Draw large coverage area circle for each selected governorate
      const coverageCircle = L.circle([gov.lat, gov.lng], {
        radius: gov.name === 'دمشق' ? 8000 : 22000,
        color: '#D4AF37', // Luxury gold border
        fillColor: '#6EE787',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '8, 6',
      });

      coverageCircle.bindTooltip(
        `<b>تغطية إعلانية نشطة: ${gov.name}</b><br/>جمهور ميتا: ${gov.audience}`,
        {
          direction: 'top',
          className: 'bg-[#071910] text-[#6EE787] border border-[#6EE787]/40 text-xs rounded-xl p-1.5',
        }
      );

      provCirclesGroupRef.current?.addLayer(coverageCircle);
    });
  }, [selectedProvs]);

  // --------------------------------------------------------------------------
  // 5. Actions: Fly to Governorate & Toggle
  // --------------------------------------------------------------------------
  const flyToGov = (gov: GovernorateData) => {
    triggerHaptic('medium');
    setActiveGovInfo(gov);
    if (mapRef.current) {
      mapRef.current.flyTo([gov.lat, gov.lng], gov.defaultZoom, {
        duration: 1.2,
      });
    }
  };

  const toggleGov = (gov: GovernorateData) => {
    triggerHaptic('medium');
    setActiveGovInfo(gov);
    setSelectedProvs((prev) => {
      const exists = prev.includes(gov.name);
      if (exists) {
        onShowToast(`تم إلغاء استهداف: ${gov.name}`);
        return prev.filter((p) => p !== gov.name);
      } else {
        onShowToast(`تم تفعيل تغطية: ${gov.name} (${gov.audience} مستخدم)`);
        // fly to the newly activated governorate
        flyToGov(gov);
        return [...prev, gov.name];
      }
    });
  };

  const applyRegionPreset = (label: string, names: string[]) => {
    triggerHaptic('success');
    setSelectedProvs(names);
    onShowToast(`تم تفعيل التغطية الإعلانية: ${label} (${fmtAr(names.length)} محافظات)`);

    // Fit map bounds to encompass all selected
    const selectedGovs = SYRIA_GOVERNORATES.filter((g) => names.includes(g.name));
    if (selectedGovs.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(selectedGovs.map((g) => [g.lat, g.lng]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  // --------------------------------------------------------------------------
  // 6. Fly to Local Hotspot & Drop Pin
  // --------------------------------------------------------------------------
  const addHotspot = (spot: (typeof SYRIAN_LOCAL_HOTSPOTS)[number]) => {
    triggerHaptic('success');
    if (mapRef.current) {
      mapRef.current.flyTo([spot.lat, spot.lng], 15, { duration: 1.1 });
    }

    const exists = spots.some((s) => s.nm === spot.nm);
    if (exists) {
      setSpots((prev) => prev.filter((s) => s.nm !== spot.nm));
      onShowToast(`تمت إزالة نقطة: ${spot.nm}`);
      return;
    }

    setSpots((prev) => [
      ...prev,
      {
        nm: spot.nm,
        k: spot.k,
        r: spot.r,
        x: Math.round(spot.lng * 10),
        y: Math.round(spot.lat * 10),
        lat: spot.lat,
        lng: spot.lng,
        city: spot.city,
      },
    ]);
    onShowToast(`تم تحديد واستهداف: ${spot.nm} (${fmtAr(spot.r)}م)`);
  };

  // --------------------------------------------------------------------------
  // 7. Live Street Search via Nominatim & Syrian Landmarks
  // --------------------------------------------------------------------------
  const handleSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);

    try {
      // 1. Instant local matching against Syrian Hotspots & Cities
      const localMatches = SYRIAN_LOCAL_HOTSPOTS.filter(
        (h) => h.nm.includes(q) || h.city.includes(q)
      ).map((h) => ({
        display_name: `${h.nm} — ${h.city}`,
        lat: String(h.lat),
        lon: String(h.lng),
        type: h.k,
      }));

      // 2. Fetch from OpenStreetMap Nominatim restricted to Syrian bounding box
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q + ' سوريا'
        )}&viewbox=35.5,37.3,42.4,32.3&bounded=1&limit=5&accept-language=ar`,
        { headers: { 'Accept-Language': 'ar' } }
      );
      const data = await resp.json();

      const combined = [...localMatches, ...(Array.isArray(data) ? data : [])];
      // remove duplicates by coords
      const unique = combined.filter(
        (item, idx, self) =>
          idx ===
          self.findIndex(
            (t) =>
              Math.abs(Number(t.lat) - Number(item.lat)) < 0.005 &&
              Math.abs(Number(t.lon) - Number(item.lon)) < 0.005
          )
      );

      setSearchResults(unique.slice(0, 5));
    } catch {
      // fallback to local matches
      const localOnly = SYRIAN_LOCAL_HOTSPOTS.filter(
        (h) => h.nm.includes(q) || h.city.includes(q)
      ).map((h) => ({
        display_name: `${h.nm} — ${h.city}`,
        lat: String(h.lat),
        lon: String(h.lng),
        type: h.k,
      }));
      setSearchResults(localOnly);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: { display_name: string; lat: string; lon: string }) => {
    triggerHaptic('success');
    const lat = Number(item.lat);
    const lng = Number(item.lon);

    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
    }

    const shortName = item.display_name.split('،')[0] || item.display_name;

    setSpots((prev) => [
      ...prev,
      {
        nm: shortName,
        k: 'بحث دقيق',
        r: spotRadius,
        x: Math.round(lng * 10),
        y: Math.round(lat * 10),
        lat,
        lng,
        address: item.display_name,
      },
    ]);

    setSearchQuery('');
    setSearchResults([]);
    onShowToast(`تم الانتقال واستهداف: ${shortName}`);
  };

  // Zoom helpers
  const zoomIn = () => {
    triggerHaptic('light');
    mapRef.current?.zoomIn();
  };

  const zoomOut = () => {
    triggerHaptic('light');
    mapRef.current?.zoomOut();
  };

  const resetSyria = () => {
    triggerHaptic('medium');
    mapRef.current?.flyTo([34.8, 38.5], 7, { duration: 1.2 });
    onShowToast('تمت إعادة ضبط إطار خريطة كامل سوريا');
  };

  return (
    <div className="space-y-3">
      {/* مفتاح التبديل الرئيسي بين التغطية العامة والاستهداف الدقيق */}
      <div className="bg-[#E6ECE6] p-1 rounded-full grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setZoneTab('g');
          }}
          className={`py-2 rounded-full text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            zoneTab === 'g' ? 'bg-[#111D15] text-white shadow-xs' : 'text-[#4A5D50]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#6EE787]" />
          <span>تغطية المحافظات السورية ({fmtAr(selectedProvs.length)})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setZoneTab('p');
          }}
          className={`py-2 rounded-full text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            zoneTab === 'p' ? 'bg-[#111D15] text-white shadow-xs' : 'text-[#4A5D50]'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 text-[#6EE787]" />
          <span>الشوارع والمحلات بالرادار ({fmtAr(spots.length)})</span>
        </button>
      </div>

      {/* بطاقة الخريطة الاحترافية (Real GIS Leaflet Map Container) */}
      <div className="rounded-[26px] bg-gradient-to-br from-[#6EE787] via-[#86EFAC] to-[#B8F5BE] p-3 text-[#092012] shadow-xs space-y-2.5">
        {/* شريط الاختصارات الجغرافية السريعة للأقاليم */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {[
            {
              label: 'كل سوريا (14)',
              list: SYRIA_GOVERNORATES.map((g) => g.name),
            },
            {
              label: 'دمشق وريفها',
              list: ['دمشق', 'ريف دمشق'],
            },
            {
              label: 'حلب والشهباء',
              list: ['حلب'],
            },
            {
              label: 'الساحل (اللاذقية وطرطوس)',
              list: ['اللاذقية', 'طرطوس'],
            },
            {
              label: 'الوسط (حمص وحماة)',
              list: ['حمص', 'حماة'],
            },
            {
              label: 'الجنوب (حوران وجبل العرب)',
              list: ['درعا', 'السويداء', 'القنيطرة'],
            },
            {
              label: 'المنطقة الشرقية',
              list: ['دير الزور', 'الرقة', 'الحسكة'],
            },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyRegionPreset(preset.label, preset.list)}
              className="px-2.5 py-1 rounded-full bg-[#092012]/10 hover:bg-[#092012] hover:text-[#6EE787] text-[#092012] text-[10px] font-extrabold transition shrink-0 cursor-pointer active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* بطاقة ملخص البث المباشر وأداء التغطية */}
        <div className="bg-[#06180F] rounded-2xl p-2.5 text-white border border-[#6EE787]/30 shadow-md">
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6EE787] animate-ping absolute opacity-75" />
                <span className="w-2 h-2 rounded-full bg-[#6EE787]" />
              </div>
              <div className="flex items-center gap-1 font-black text-[#6EE787]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>تغطية إعلانية جغرافية:</span>
              </div>
              <span className="text-white/90 font-bold">
                {selectedProvs.length} محافظات ({coveragePercent}%) + {spots.length} دبابيس دقيقة
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#86EFAC] bg-white/10 px-2 py-0.5 rounded-full">
              <Users className="w-3 h-3" />
              <span>{(totalAudienceInSelected / 1000).toFixed(2)}M مستهدف</span>
            </div>
          </div>

          <div className="mt-2 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4ADE80] to-[#6EE787] h-full transition-all duration-500 rounded-full shadow-[0_0_8px_#6EE787]"
              style={{ width: `${Math.max(10, coveragePercent)}%` }}
            />
          </div>
        </div>

        {/* حقل البحث الفوري عن شوارع وأسواق ومحلات سوريا */}
        <div className="relative z-30">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="ابحث عن أي شارع، حي، سوق، أو محل في سوريا (مثل: الشعلان، الجميلية، المزة)..."
              className="w-full bg-[#06180F] border border-[#6EE787]/40 text-white placeholder:text-white/45 text-xs rounded-xl pr-9 pl-4 py-2 font-bold focus:outline-none focus:border-[#6EE787] focus:ring-1 focus:ring-[#6EE787] shadow-inner"
            />
            <Search className="w-4 h-4 text-[#6EE787] absolute right-3 pointer-events-none" />
            {isSearching && (
              <span className="absolute left-3 text-[10px] text-[#6EE787] animate-pulse">
                جارٍ البحث...
              </span>
            )}
          </div>

          {/* قائمة نتائج البحث السريع */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-[#071910] border border-[#6EE787]/40 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-white/10">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full px-3 py-2 text-right text-xs font-bold text-white hover:bg-[#112F20] hover:text-[#6EE787] transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#6EE787] shrink-0" />
                    <span className="truncate max-w-[260px]">{item.display_name}</span>
                  </div>
                  <span className="text-[9px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full shrink-0">
                    {item.type || 'موقع'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* أزرار سريعة لأشهر الأسواق والأحياء التجارية */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold text-[#092012]/80 flex items-center gap-1">
              <Store className="w-3 h-3 text-[#092012]" />
              <span>أشهر الأسواق والأحياء التجارية (انقر للوصول والتثبيت المباشر):</span>
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {SYRIAN_LOCAL_HOTSPOTS.map((hotspot) => {
              const active = spots.some((s) => s.nm === hotspot.nm);
              return (
                <button
                  key={hotspot.nm}
                  type="button"
                  onClick={() => addHotspot(hotspot)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shrink-0 transition cursor-pointer active:scale-95 shadow-2xs ${
                    active
                      ? 'bg-[#111D15] text-[#6EE787] border border-[#6EE787]'
                      : 'bg-white/80 text-[#092012] hover:bg-white'
                  }`}
                >
                  {active ? <Check className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  <span>{hotspot.nm}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* حاوية خريطة LEAFLET التفاعلية الحقيقية */}
        <div className="relative rounded-2xl bg-[#071910] border border-[#092012]/30 overflow-hidden shadow-2xl h-84">
          {/* طبقة المسح الراداري الدوار وشبكة HUD المستقبلية (Radar-Scan Sweep Beam) */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {/* حزمة المسح الراداري الدوارة */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full radar-sweep-beam opacity-35 pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(110, 231, 135, 0.45) 0deg, rgba(110, 231, 135, 0) 70deg, transparent 70deg)',
              }}
            />
            {/* دوائر النطاق الراداري المتمركزة */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[#6EE787]/15 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#6EE787]/10 pointer-events-none" />
            {/* خط المسح الضوئي العمودي المتحرك */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6EE787]/8 to-transparent h-12 w-full hud-scanline pointer-events-none" />
          </div>

          {/* شريط أدوات الخريطة العائم (أعلى اليسار): التكبير والتصغير وضبط الإطار */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={zoomIn}
              aria-label="تكبير"
              className="w-8 h-8 rounded-xl bg-[#092214]/90 backdrop-blur-md border border-[#6EE787]/40 text-white grid place-items-center hover:bg-[#6EE787] hover:text-[#06180F] transition shadow-md cursor-pointer active:scale-95"
              title="تكبير الخريطة"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              aria-label="تصغير"
              className="w-8 h-8 rounded-xl bg-[#092214]/90 backdrop-blur-md border border-[#6EE787]/40 text-white grid place-items-center hover:bg-[#6EE787] hover:text-[#06180F] transition shadow-md cursor-pointer active:scale-95"
              title="تصغير الخريطة"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetSyria}
              aria-label="إعادة ضبط لسوريا كاملة"
              className="w-8 h-8 rounded-xl bg-[#6EE787] text-[#071910] font-black grid place-items-center shadow-lg cursor-pointer hover:bg-white transition active:scale-95"
              title="عرض كامل سوريا"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="bg-black/75 backdrop-blur-xs text-[#6EE787] text-[9px] font-black text-center py-0.5 px-1.5 rounded-md border border-[#6EE787]/20">
              Z:{currentZoom}
            </div>
          </div>

          {/* محدد نمط الخريطة العائم (أعلى اليمين: زمردي ليلي / شوارع OSM / أقمار صناعية) */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-[#092214]/90 backdrop-blur-md border border-[#6EE787]/30 rounded-xl p-1 shadow-lg">
            {(['dark', 'osm', 'satellite'] as TileTheme[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setTileTheme(mode);
                }}
                className={`px-2 py-1 rounded-lg text-[9px] font-extrabold transition cursor-pointer ${
                  tileTheme === mode
                    ? 'bg-[#6EE787] text-[#06180F] shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {mode === 'dark' ? '🌑 زمردي' : mode === 'osm' ? '🗺️ شوارع' : '🛰️ أقمار'}
              </button>
            ))}
          </div>

          {/* شارة إرشادية وإحداثيات HUD الحية أسفل الخريطة */}
          <div className="absolute bottom-2.5 left-2.5 z-20 bg-[#071910]/90 backdrop-blur-md border border-[#6EE787]/30 px-2 py-1 rounded-xl text-[9px] text-white/90 font-mono flex items-center gap-1.5 shadow-md pointer-events-none">
            <div className="flex items-center gap-1 text-[#6EE787]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6EE787] animate-ping" />
              <span className="font-bold">رادار ميتا</span>
            </div>
            <span className="text-white/40">|</span>
            <span dir="ltr">{activeCenter.lat.toFixed(3)}°N, {activeCenter.lng.toFixed(3)}°E</span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 z-20 bg-[#071910]/85 backdrop-blur-md border border-[#6EE787]/30 px-2.5 py-1 rounded-full text-[9px] text-[#86EFAC] font-extrabold flex items-center gap-1.5 shadow-md pointer-events-none">
            <Crosshair className="w-3 h-3 text-[#6EE787] animate-pulse" />
            <span>انقر لإسقاط دبوس GPS ورادار</span>
          </div>

          {/* حاوية Leaflet الفعلية */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* لوحة تحكم نصف قطر الاستهداف الدقيق (GPS Radius Controls) - حركة تفاعلية لتوسيع وتصغير المسار */}
        <div className="bg-[#06180F] rounded-2xl p-3 text-white border border-[#6EE787]/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-white/90">
              <Sliders className="w-3.5 h-3.5 text-[#6EE787]" />
              <span>
                نطاق مسار الرادار{' '}
                <span className="text-[#86EFAC] font-normal text-[10px]">
                  {spots.length > 0 && selectedSpotIdx !== null && spots[selectedSpotIdx]
                    ? `(نشط: ${spots[selectedSpotIdx].nm})`
                    : '(اسحب لتوسيع وتصغير الدائرة)'}
                </span>
                :
              </span>
            </span>
            <span className="text-[#6EE787] font-black tabular-nums bg-white/10 px-2 py-0.5 rounded-full text-[11px] shadow-[0_0_8px_rgba(110,231,135,0.3)]">
              {spotRadius >= 1000
                ? `${(spotRadius / 1000).toFixed(1)} كم (${fmtAr(spotRadius)} متر)`
                : `${fmtAr(spotRadius)} متر`}
            </span>
          </div>

          {/* شريط السحب التفاعلي: يوسع ويصغر المسار/الدائرة على الخريطة مباشرة */}
          <input
            type="range"
            min={200}
            max={20000}
            step={100}
            value={spotRadius}
            onChange={(e) => {
              triggerHaptic('light');
              handleRadiusChange(Number(e.target.value));
            }}
            className="w-full accent-[#6EE787] cursor-pointer"
            title="اسحب لتكبير وتصغير مسار التحديد على الخريطة"
          />

          {/* أزرار سريعة للأقطار الشائعة مع توسيع وتصغير فوري للمسار */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {[500, 1000, 2000, 3000, 5000, 10000, 20000].map((rVal) => (
              <button
                key={rVal}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  handleRadiusChange(rVal);
                }}
                className={`px-2 py-0.5 rounded-md text-[9px] font-black transition cursor-pointer active:scale-95 ${
                  spotRadius === rVal
                    ? 'bg-[#6EE787] text-[#06180F] shadow-[0_0_8px_#6EE787]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {rVal >= 1000 ? `${rVal / 1000} كم` : `${rVal} م`}
              </button>
            ))}
          </div>
        </div>

        {/* محدد المحافظات الـ ١٤ السريعة للتفعيل المباشر (Macro Governorate Badges) */}
        <div className="space-y-1">
          <span className="text-[10px] font-black text-[#092012]/80 block">
            المحافظات السورية (انقر للتبديل والانتقال المباشر):
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
            {SYRIA_GOVERNORATES.map((gov) => {
              const isSelected = selectedProvs.includes(gov.name);
              return (
                <button
                  key={gov.name}
                  type="button"
                  onClick={() => toggleGov(gov)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    isSelected
                      ? 'bg-[#092012] text-[#6EE787] border border-[#6EE787] shadow-xs'
                      : 'bg-white/60 text-[#092012] hover:bg-white'
                  }`}
                >
                  <span className="truncate w-full text-center">{gov.name}</span>
                  <span className="text-[8px] opacity-75 font-mono">{gov.audience}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* شرائح الدبابيس والمناطق المحددة في الحملة مع إمكانية الحذف */}
      <div className="bg-white/70 rounded-2xl p-2.5 border border-[#111D15]/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-extrabold text-[#092012]">
          <span>المواقع المشمولة في استهداف إعلانات ميتا ({selectedProvs.length + spots.length}):</span>
          <span className="text-[#15803D]">جاهزة للإطلاق ✦</span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
          {selectedProvs.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedProvs((prev) => prev.filter((item) => item !== p));
              }}
              className="px-2.5 py-1 rounded-full bg-[#111D15] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs hover:bg-black"
              title="انقر للحذف"
            >
              <MapPin className="w-3 h-3 text-[#6EE787]" />
              <span>محافظة {p}</span>
              <span className="opacity-70 text-xs">✕</span>
            </button>
          ))}

          {spots.map((s, idx) => {
            const isSelected = selectedSpotIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedSpotIdx(idx);
                  setSpotRadius(s.r);
                  if (mapRef.current && s.lat && s.lng) {
                    mapRef.current.flyTo([s.lat, s.lng], 15, { duration: 0.8 });
                  }
                  onShowToast(`تم تحديد مسار: ${s.nm} — اسحب الشريط لتعديل النطاق`);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs transition ${
                  isSelected
                    ? 'bg-[#D4AF37] text-black font-black ring-2 ring-white shadow-md'
                    : 'bg-[#15803D] text-white hover:bg-[#166534]'
                }`}
                title="انقر لتحديد المسار وتعديل قطره بالشريط"
              >
                <Crosshair className={`w-3 h-3 ${isSelected ? 'text-black' : 'text-[#86EFAC]'}`} />
                <span>
                  {s.nm} ({fmtAr(s.r)}م)
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('medium');
                    setSpots((prev) => prev.filter((_, i) => i !== idx));
                    if (selectedSpotIdx === idx) setSelectedSpotIdx(null);
                    onShowToast(`تمت إزالة: ${s.nm}`);
                  }}
                  className="opacity-75 hover:opacity-100 p-0.5 hover:text-red-400 font-black text-xs"
                  title="حذف هذا الدبوس"
                >
                  ✕
                </span>
              </button>
            );
          })}

          {selectedProvs.length === 0 && spots.length === 0 && (
            <span className="text-xs text-[#092012]/60 italic py-1">
              لم يتم تحديد أي موقع بعد، اضغط على الخريطة أو اختر محافظة للبدء.
            </span>
          )}
        </div>
      </div>

      {/* زر المتابعة لتمويل الحملة والميزانية */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('medium');
          onNext();
        }}
        className="w-full py-2.5 px-4 rounded-full bg-[#111D15] text-white font-extrabold text-xs flex items-center justify-between cursor-pointer hover:bg-black active:scale-[0.98] transition shadow-md"
      >
        <span>التالي: الميزانية وتمويل ميتا</span>
        <ArrowLeft className="w-4 h-4 text-[#6EE787]" />
      </button>
    </div>
  );
};
