// cards.js - 48장 화투패 데이터 및 SVG 렌더러

export const CARD_TYPES = {
  GWANG: 'gwang',      // 광 (Light)
  YEOL: 'yeol',        // 열끗 (Animal / Special)
  TTI: 'tti',          // 띠 (Ribbon)
  PI: 'pi',            // 피 (Junk)
  SSANG_PI: 'ssangpi'  // 쌍피 (Double Junk)
};

export const RIBBON_TYPES = {
  HONGDAN: 'hongdan',      // 홍단 (1, 2, 3월)
  CHEONGDAN: 'cheongdan',  // 청단 (6, 9, 10월)
  CHODAN: 'chodan'         // 초단 (4, 5, 7월)
};

export const MONTH_NAMES = [
  "", "1월 송학", "2월 매화", "3월 벚꽃", "4월 흑싸리",
  "5월 난초", "6월 모란", "7월 홍싸리", "8월 공산",
  "9월 국화", "10월 단풍", "11월 오동", "12월 비"
];

// 48장 화투패 데이터 정의
export const CARDS_DATA = [
  // 1월 송학 (Pine)
  { id: 'c01_gwang', month: 1, type: CARD_TYPES.GWANG, name: '1월 일광', isGwang: true, icon: '☀️' },
  { id: 'c01_hong',  month: 1, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.HONGDAN, name: '1월 홍단', text: '홍단' },
  { id: 'c01_pi1',   month: 1, type: CARD_TYPES.PI,    name: '1월 피1' },
  { id: 'c01_pi2',   month: 1, type: CARD_TYPES.PI,    name: '1월 피2' },

  // 2월 매화 (Plum)
  { id: 'c02_bird',  month: 2, type: CARD_TYPES.YEOL,  isGodori: true, name: '2월 고도리(꾀꼬리)', icon: '🕊️' },
  { id: 'c02_hong',  month: 2, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.HONGDAN, name: '2월 홍단', text: '홍단' },
  { id: 'c02_pi1',   month: 2, type: CARD_TYPES.PI,    name: '2월 피1' },
  { id: 'c02_pi2',   month: 2, type: CARD_TYPES.PI,    name: '2월 피2' },

  // 3월 벚꽃 (Cherry blossom)
  { id: 'c03_gwang', month: 3, type: CARD_TYPES.GWANG, name: '3월 벚꽃광', isGwang: true, icon: '🌸' },
  { id: 'c03_hong',  month: 3, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.HONGDAN, name: '3월 홍단', text: '홍단' },
  { id: 'c03_pi1',   month: 3, type: CARD_TYPES.PI,    name: '3월 피1' },
  { id: 'c03_pi2',   month: 3, type: CARD_TYPES.PI,    name: '3월 피2' },

  // 4월 흑싸리 (Bush clover)
  { id: 'c04_bird',  month: 4, type: CARD_TYPES.YEOL,  isGodori: true, name: '4월 고도리(두견새)', icon: '🐦' },
  { id: 'c04_cho',   month: 4, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.CHODAN, name: '4월 초단', text: '초단' },
  { id: 'c04_pi1',   month: 4, type: CARD_TYPES.PI,    name: '4월 피1' },
  { id: 'c04_pi2',   month: 4, type: CARD_TYPES.PI,    name: '4월 피2' },

  // 5월 난초 (Orchid)
  { id: 'c05_bridge',month: 5, type: CARD_TYPES.YEOL,  name: '5월 다리(열끗)', icon: '🌉' },
  { id: 'c05_cho',   month: 5, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.CHODAN, name: '5월 초단', text: '초단' },
  { id: 'c05_pi1',   month: 5, type: CARD_TYPES.PI,    name: '5월 피1' },
  { id: 'c05_pi2',   month: 5, type: CARD_TYPES.PI,    name: '5월 피2' },

  // 6월 모란 (Peony)
  { id: 'c06_butter',month: 6, type: CARD_TYPES.YEOL,  name: '6월 나비(열끗)', icon: '🦋' },
  { id: 'c06_cheong',month: 6, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.CHEONGDAN, name: '6월 청단', text: '청단' },
  { id: 'c06_pi1',   month: 6, type: CARD_TYPES.PI,    name: '6월 피1' },
  { id: 'c06_pi2',   month: 6, type: CARD_TYPES.PI,    name: '6월 피2' },

  // 7월 홍싸리 (Red bush clover)
  { id: 'c07_boar',  month: 7, type: CARD_TYPES.YEOL,  name: '7월 멧돼지(열끗)', icon: '🐗' },
  { id: 'c07_cho',   month: 7, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.CHODAN, name: '7월 초단', text: '초단' },
  { id: 'c07_pi1',   month: 7, type: CARD_TYPES.PI,    name: '7월 피1' },
  { id: 'c07_pi2',   month: 7, type: CARD_TYPES.PI,    name: '7월 피2' },

  // 8월 공산 (August Moon)
  { id: 'c08_gwang', month: 8, type: CARD_TYPES.GWANG, name: '8월 팔광', isGwang: true, icon: '🌕' },
  { id: 'c08_bird',  month: 8, type: CARD_TYPES.YEOL,  isGodori: true, name: '8월 고도리(기러기)', icon: '🦆' },
  { id: 'c08_pi1',   month: 8, type: CARD_TYPES.PI,    name: '8월 피1' },
  { id: 'c08_pi2',   month: 8, type: CARD_TYPES.PI,    name: '8월 피2' },

  // 9월 국화 (Chrysanthemum)
  { id: 'c09_cup',   month: 9, type: CARD_TYPES.YEOL,  name: '9월 국진(술잔 쌍피/열끗)', icon: '🍶', isSsangpiConvertible: true },
  { id: 'c09_cheong',month: 9, type: CARD_TYPES.TTI,   subType: RIBBON_TYPES.CHEONGDAN, name: '9월 청단', text: '청단' },
  { id: 'c09_pi1',   month: 9, type: CARD_TYPES.PI,    name: '9월 피1' },
  { id: 'c09_pi2',   month: 9, type: CARD_TYPES.PI,    name: '9월 피2' },

  // 10월 단풍 (Maple)
  { id: 'c10_deer',  month: 10, type: CARD_TYPES.YEOL, name: '10월 사슴(열끗)', icon: '🦌' },
  { id: 'c10_cheong',month: 10, type: CARD_TYPES.TTI,  subType: RIBBON_TYPES.CHEONGDAN, name: '10월 청단', text: '청단' },
  { id: 'c10_pi1',   month: 10, type: CARD_TYPES.PI,   name: '10월 피1' },
  { id: 'c10_pi2',   month: 10, type: CARD_TYPES.PI,   name: '10월 피2' },

  // 11월 오동 (Paulownia)
  { id: 'c11_gwang', month: 11, type: CARD_TYPES.GWANG, name: '11월 똥광', isGwang: true, icon: '👑' },
  { id: 'c11_ssang', month: 11, type: CARD_TYPES.SSANG_PI, name: '11월 쌍피', piValue: 2 },
  { id: 'c11_pi1',   month: 11, type: CARD_TYPES.PI,   name: '11월 피1' },
  { id: 'c11_pi2',   month: 11, type: CARD_TYPES.PI,   name: '11월 피2' },

  // 12월 비 (Rain)
  { id: 'c12_gwang', month: 12, type: CARD_TYPES.GWANG, name: '12월 비광', isGwang: true, isRainGwang: true, icon: '☔' },
  { id: 'c12_yeol',  month: 12, type: CARD_TYPES.YEOL,  name: '12월 비열끗', icon: '🐸' },
  { id: 'c12_tti',   month: 12, type: CARD_TYPES.TTI,   name: '12월 비단', text: '비단' },
  { id: 'c12_ssang', month: 12, type: CARD_TYPES.SSANG_PI, name: '12월 비쌍피', piValue: 2 }
];

// 월별 테마 색상 및 대표 모티프 스타일
const MONTH_THEMES = {
  1:  { bg: '#FFF7ED', plant: '#1E3A8A', sub: '#B91C1C', label: '松 (송학)' },
  2:  { bg: '#FFF1F2', plant: '#BE123C', sub: '#FB7185', label: '梅 (매화)' },
  3:  { bg: '#FDF2F8', plant: '#EC4899', sub: '#F472B6', label: '櫻 (벚꽃)' },
  4:  { bg: '#F3F4F6', plant: '#1F2937', sub: '#374151', label: '藤 (흑싸리)' },
  5:  { bg: '#F0FDF4', plant: '#15803D', sub: '#22C55E', label: '蘭 (난초)' },
  6:  { bg: '#FAF5FF', plant: '#9333EA', sub: '#A855F7', label: '牧 (모란)' },
  7:  { bg: '#FEF2F2', plant: '#DC2626', sub: '#EF4444', label: '萩 (홍싸리)' },
  8:  { bg: '#F8FAFC', plant: '#0F172A', sub: '#EAB308', label: '芒 (공산)' },
  9:  { bg: '#FFFBEB', plant: '#D97706', sub: '#F59E0B', label: '菊 (국화)' },
  10: { bg: '#FFF7ED', plant: '#EA580C', sub: '#C2410C', label: '楓 (단풍)' },
  11: { bg: '#F5F3FF', plant: '#4C1D95', sub: '#7C3AED', label: '桐 (오동)' },
  12: { bg: '#EFF6FF', plant: '#1E40AF', sub: '#0284C7', label: '柳 (비)' }
};

/**
 * 화투 카드 SVG 렌더러: 순수 SVG와 CSS로 선명하고 고급스러운 정통 화투패 룩앤필 제공
 */
export function renderCardHTML(card, isFlipped = false) {
  if (isFlipped) {
    return `
      <div class="hwatu-card card-back">
        <div class="card-inner back-pattern">
          <div class="back-seal">花</div>
        </div>
      </div>
    `;
  }

  const theme = MONTH_THEMES[card.month] || { bg: '#FFF', plant: '#333', sub: '#666', label: '' };
  
  // 뱃지 렌더링
  let badgeHTML = '';
  if (card.isGwang) {
    badgeHTML = `<div class="card-badge badge-gwang">${card.isRainGwang ? '비광' : '光'}</div>`;
  } else if (card.type === CARD_TYPES.TTI) {
    if (card.subType === RIBBON_TYPES.HONGDAN) {
      badgeHTML = `<div class="card-badge badge-hongdan">홍단</div>`;
    } else if (card.subType === RIBBON_TYPES.CHEONGDAN) {
      badgeHTML = `<div class="card-badge badge-cheongdan">청단</div>`;
    } else if (card.subType === RIBBON_TYPES.CHODAN) {
      badgeHTML = `<div class="card-badge badge-chodan">초단</div>`;
    } else {
      badgeHTML = `<div class="card-badge badge-tti">띠</div>`;
    }
  } else if (card.isGodori) {
    badgeHTML = `<div class="card-badge badge-godori">고도리</div>`;
  } else if (card.type === CARD_TYPES.SSANG_PI || card.id === 'c09_cup') {
    badgeHTML = `<div class="card-badge badge-ssangpi">쌍피</div>`;
  }

  // 월별 식물/자연 드로잉 SVG
  const artSVG = getMonthArtworkSVG(card, theme);

  return `
    <div class="hwatu-card card-month-${card.month} type-${card.type}" data-card-id="${card.id}" data-month="${card.month}">
      <div class="card-inner" style="--card-bg: ${theme.bg};">
        <div class="month-num">${card.month}</div>
        ${badgeHTML}
        <div class="card-artwork">
          ${artSVG}
        </div>
        <div class="card-footer-info">
          <span class="kanji-name">${theme.label.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  `;
}

function getMonthArtworkSVG(card, theme) {
  const p = theme.plant;
  const s = theme.sub;
  const m = card.month;

  // 카드별 특수 상징 오브젝트
  let mainGraphic = '';

  if (card.icon) {
    mainGraphic = `<text x="50" y="46" font-size="28" text-anchor="middle" dominant-baseline="central" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">${card.icon}</text>`;
  }

  // 월별 배경 식물 실루엣
  let plantBranch = '';
  switch (m) {
    case 1: // 솔가지
      plantBranch = `
        <path d="M 15,90 Q 40,65 50,45 Q 60,30 85,15" stroke="${p}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 40,65 Q 20,50 15,35 M 40,65 Q 25,68 10,75" stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 60,35 Q 80,45 88,60 M 60,35 Q 85,25 90,35" stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      break;
    case 2: // 매화 가지 & 꽃
      plantBranch = `
        <path d="M 10,95 Q 35,60 55,45 Q 75,30 85,10" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="28" cy="70" r="6" fill="${p}" opacity="0.9"/>
        <circle cx="68" cy="38" r="7" fill="${p}" opacity="0.9"/>
        <circle cx="48" cy="50" r="5" fill="${s}" opacity="0.9"/>
        <circle cx="82" cy="18" r="4.5" fill="${p}"/>
      `;
      break;
    case 3: // 벚꽃
      plantBranch = `
        <path d="M 20,95 C 40,75 50,55 50,30" stroke="#854D0E" stroke-width="3.5" fill="none"/>
        <circle cx="35" cy="55" r="7" fill="${s}" opacity="0.85"/>
        <circle cx="65" cy="45" r="8" fill="${p}" opacity="0.85"/>
        <circle cx="50" cy="25" r="9" fill="${p}"/>
        <circle cx="50" cy="25" r="3" fill="#FEF08A"/>
      `;
      break;
    case 4: // 흑싸리 덩굴
      plantBranch = `
        <path d="M 50,5 Q 45,45 25,85 M 50,15 Q 60,50 75,90 M 50,25 Q 50,60 48,95" stroke="${p}" stroke-width="2.5" fill="none" stroke-dasharray="3,3"/>
      `;
      break;
    case 5: // 난초 잎
      plantBranch = `
        <path d="M 20,95 Q 25,45 35,15 Q 40,45 50,95" fill="${p}" opacity="0.75"/>
        <path d="M 45,95 Q 65,40 80,20 Q 70,55 60,95" fill="${s}" opacity="0.75"/>
      `;
      break;
    case 6: // 모란 꽃잎
      plantBranch = `
        <circle cx="50" cy="58" r="18" fill="${p}" opacity="0.7"/>
        <circle cx="50" cy="58" r="11" fill="${s}"/>
        <path d="M 50,76 L 50,95" stroke="#166534" stroke-width="4"/>
      `;
      break;
    case 7: // 홍싸리
      plantBranch = `
        <path d="M 50,95 Q 35,55 25,20 M 50,95 Q 65,55 75,25" stroke="${p}" stroke-width="3" fill="none"/>
        <circle cx="28" cy="25" r="4" fill="${s}"/>
        <circle cx="72" cy="30" r="4" fill="${s}"/>
      `;
      break;
    case 8: // 보름달 & 억새
      plantBranch = `
        <path d="M 0,75 Q 50,60 100,75 L 100,100 L 0,100 Z" fill="#1E293B"/>
        <path d="M 20,70 L 25,45 M 50,65 L 52,40 M 80,68 L 78,42" stroke="#94A3B8" stroke-width="2"/>
      `;
      break;
    case 9: // 국화
      plantBranch = `
        <circle cx="50" cy="50" r="14" fill="${s}"/>
        <circle cx="50" cy="50" r="6" fill="#FEF08A"/>
        <path d="M 50,64 L 50,95" stroke="#15803D" stroke-width="3.5"/>
      `;
      break;
    case 10: // 단풍잎
      plantBranch = `
        <polygon points="50,20 58,35 75,32 65,46 72,62 50,52 28,62 35,46 25,32 42,35" fill="${p}"/>
        <path d="M 50,52 L 50,90" stroke="#7C2D12" stroke-width="3"/>
      `;
      break;
    case 11: // 오동잎
      plantBranch = `
        <path d="M 50,30 C 20,40 25,80 50,85 C 75,80 80,40 50,30 Z" fill="${p}" opacity="0.85"/>
        <line x1="50" y1="30" x2="50" y2="92" stroke="#FEF08A" stroke-width="2.5"/>
      `;
      break;
    case 12: // 수양버들 & 비
      plantBranch = `
        <path d="M 10,0 Q 40,40 20,80 M 50,0 Q 80,45 60,95 M 90,0 Q 65,35 85,85" stroke="#0284C7" stroke-width="2" fill="none" stroke-dasharray="4,4"/>
      `;
      break;
  }

  return `
    <svg viewBox="0 0 100 100" class="card-svg" xmlns="http://www.w3.org/2000/svg">
      <g class="month-plant">${plantBranch}</g>
      <g class="main-graphic">${mainGraphic}</g>
    </svg>
  `;
}
