// rules.js - 맞고(2인 고스톱) 게임 규칙 및 점수 계산 엔진

import { CARD_TYPES, RIBBON_TYPES, CARDS_DATA } from './cards.js';

export const WIN_SCORE = 7; // 맞고 승리 기준 점수

/**
 * 덱 셔플 및 초기 패 분배
 * 맞고 기준: 각 플레이어 10장, 바닥 8장, 덱 20장
 */
export function dealCards() {
  const deck = [...CARDS_DATA];
  
  // Fisher-Yates 셔플
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const p1Hand = deck.splice(0, 10);
  const p2Hand = deck.splice(0, 10);
  const field = deck.splice(0, 8);
  const drawDeck = deck; // 20장 남음

  return { p1Hand, p2Hand, field, drawDeck };
}

/**
 * 특정 플레이어의 획득 카드 점수 세부 계산
 */
export function calculateScore(collectedCards, goCount = 0) {
  const gwangList = collectedCards.filter(c => c.isGwang);
  const yeolList = collectedCards.filter(c => c.type === CARD_TYPES.YEOL);
  const ttiList = collectedCards.filter(c => c.type === CARD_TYPES.TTI);
  
  // 피 계산 (국진 c09_cup은 쌍피로 계산, 일반 쌍피는 2개로 계산)
  let piCount = 0;
  collectedCards.forEach(c => {
    if (c.type === CARD_TYPES.PI) {
      piCount += 1;
    } else if (c.type === CARD_TYPES.SSANG_PI) {
      piCount += 2;
    } else if (c.id === 'c09_cup') {
      // 9월 국진: 보통 맞고에서는 쌍피로 쓰여 점수 극대화
      piCount += 2;
    }
  });

  const breakdown = {
    gwang: 0,
    gwangDesc: '',
    yeol: 0,
    yeolDesc: '',
    godori: false,
    tti: 0,
    ttiDesc: '',
    hongdan: false,
    cheongdan: false,
    chodan: false,
    pi: 0,
    piCount: piCount,
    goCount: goCount,
    goBonus: 0,
    multiplier: 1,
    totalBaseScore: 0,
    finalScore: 0
  };

  // 1. 광 계산
  if (gwangList.length === 5) {
    breakdown.gwang = 15;
    breakdown.gwangDesc = '오광 (15점)';
  } else if (gwangList.length === 4) {
    breakdown.gwang = 4;
    breakdown.gwangDesc = '사광 (4점)';
  } else if (gwangList.length === 3) {
    const hasRain = gwangList.some(c => c.isRainGwang);
    if (hasRain) {
      breakdown.gwang = 2;
      breakdown.gwangDesc = '비삼광 (2점)';
    } else {
      breakdown.gwang = 3;
      breakdown.gwangDesc = '삼광 (3점)';
    }
  }

  // 2. 열끗 계산
  let yeolScore = 0;
  if (yeolList.length >= 5) {
    yeolScore += (yeolList.length - 4);
    breakdown.yeolDesc = `열끗 ${yeolList.length}장 (${yeolScore}점)`;
  }
  // 고도리 판정 (2월 새, 4월 새, 8월 새)
  const godoriCards = yeolList.filter(c => c.isGodori);
  if (godoriCards.length === 3) {
    breakdown.godori = true;
    yeolScore += 5;
    breakdown.yeolDesc += breakdown.yeolDesc ? ' + 고도리 (5점)' : '고도리 (5점)';
  }
  breakdown.yeol = yeolScore;

  // 7장 이상 멍텅구리(멍따) 판정
  if (yeolList.length >= 7) {
    breakdown.multiplier *= 2;
  }

  // 3. 띠 계산
  let ttiScore = 0;
  if (ttiList.length >= 5) {
    ttiScore += (ttiList.length - 4);
    breakdown.ttiDesc = `띠 ${ttiList.length}장 (${ttiScore}점)`;
  }
  // 홍단 (1, 2, 3월)
  const hongdan = ttiList.filter(c => c.subType === RIBBON_TYPES.HONGDAN).length === 3;
  if (hongdan) {
    breakdown.hongdan = true;
    ttiScore += 3;
    breakdown.ttiDesc += breakdown.ttiDesc ? ' + 홍단 (3점)' : '홍단 (3점)';
  }
  // 청단 (6, 9, 10월)
  const cheongdan = ttiList.filter(c => c.subType === RIBBON_TYPES.CHEONGDAN).length === 3;
  if (cheongdan) {
    breakdown.cheongdan = true;
    ttiScore += 3;
    breakdown.ttiDesc += breakdown.ttiDesc ? ' + 청단 (3점)' : '청단 (3점)';
  }
  // 초단 (4, 5, 7월)
  const chodan = ttiList.filter(c => c.subType === RIBBON_TYPES.CHODAN).length === 3;
  if (chodan) {
    breakdown.chodan = true;
    ttiScore += 3;
    breakdown.ttiDesc += breakdown.ttiDesc ? ' + 초단 (3점)' : '초단 (3점)';
  }
  breakdown.tti = ttiScore;

  // 4. 피 계산
  if (piCount >= 10) {
    breakdown.pi = (piCount - 9);
  }

  // 기본 점수 합산
  breakdown.totalBaseScore = breakdown.gwang + breakdown.yeol + breakdown.tti + breakdown.pi;

  // 고(Go) 가산점 및 배수
  let scoreWithGo = breakdown.totalBaseScore;
  if (goCount === 1) {
    scoreWithGo += 1;
    breakdown.goBonus = 1;
  } else if (goCount === 2) {
    scoreWithGo += 2;
    breakdown.goBonus = 2;
  } else if (goCount >= 3) {
    // 3고부터는 기본점수에 고 수만큼 곱하고 가산
    // 표준 룰: 3고(점수 x 2), 4고(점수 x 4), 5고(점수 x 8)...
    const goMulti = Math.pow(2, goCount - 2);
    scoreWithGo = scoreWithGo * goMulti;
    breakdown.multiplier *= goMulti;
  }

  breakdown.finalScore = Math.max(0, scoreWithGo);
  return breakdown;
}

/**
 * 승자 기준 박(피박, 광박 등) 계산 및 최종 승리 금액/점수 산출
 */
export function calculateEndScore(winnerBreakdown, loserCollected, isLoserGobak = false) {
  let multiplier = winnerBreakdown.multiplier || 1;
  const penalties = [];

  // 1. 피박: 승자가 피로 1점 이상 났는데, 패자의 피가 1장 이상 5장 이하인 경우 (2배)
  let loserPiCount = 0;
  loserCollected.forEach(c => {
    if (c.type === CARD_TYPES.PI) loserPiCount += 1;
    else if (c.type === CARD_TYPES.SSANG_PI || c.id === 'c09_cup') loserPiCount += 2;
  });

  if (winnerBreakdown.pi > 0 && loserPiCount >= 1 && loserPiCount <= 5) {
    multiplier *= 2;
    penalties.push('피박 (x2)');
  }

  // 2. 광박: 승자가 광으로 점수를 냈는데 패자에게 광이 하나도 없는 경우 (2배)
  const loserGwangCount = loserCollected.filter(c => c.isGwang).length;
  if (winnerBreakdown.gwang > 0 && loserGwangCount === 0) {
    multiplier *= 2;
    penalties.push('광박 (x2)');
  }

  // 3. 멍텅구리박 (멍박): 승자가 열끗 7장 이상
  const winnerYeolCount = (winnerBreakdown.yeolList ? winnerBreakdown.yeolList.length : 0);
  if (winnerYeolCount >= 7) {
    penalties.push('멍텅구리 (x2)');
  }

  // 4. 고박(독박): 고를 부른 사람이 패배한 경우
  if (isLoserGobak) {
    multiplier *= 2;
    penalties.push('고박 (x2)');
  }

  const calculatedFinal = Math.max(winnerBreakdown.finalScore, WIN_SCORE) * (penalties.length > 0 ? (penalties.includes('피박 (x2)') ? 2 : 1) * (penalties.includes('광박 (x2)') ? 2 : 1) : 1);

  return {
    baseScore: winnerBreakdown.totalBaseScore,
    goCount: winnerBreakdown.goCount,
    penalties,
    multiplier,
    finalScore: winnerBreakdown.finalScore * (penalties.length > 0 ? (penalties.includes('피박 (x2)') ? 2 : 1) * (penalties.includes('광박 (x2)') ? 2 : 1) : 1)
  };
}

/**
 * 바닥 패에서 특정 카드와 월이 일치하는 패들을 반환
 */
export function getMatchingFieldCards(card, fieldCards) {
  return fieldCards.filter(fc => fc.month === card.month);
}

/**
 * 상대방에게서 뺏어올 수 있는 피 1장 추출 (피 우선순위: 일반 피 -> 쌍피)
 */
export function takePiFromOpponent(opponentCollected) {
  // 일반 피 먼저 찾기
  const normalPiIndex = opponentCollected.findIndex(c => c.type === CARD_TYPES.PI);
  if (normalPiIndex !== -1) {
    return opponentCollected.splice(normalPiIndex, 1)[0];
  }
  // 없으면 쌍피
  const ssangPiIndex = opponentCollected.findIndex(c => c.type === CARD_TYPES.SSANG_PI || c.id === 'c09_cup');
  if (ssangPiIndex !== -1) {
    return opponentCollected.splice(ssangPiIndex, 1)[0];
  }
  return null;
}
