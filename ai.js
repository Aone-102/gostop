// ai.js - 스마트 AI 맞고 대전 알고리즘

import { CARD_TYPES, RIBBON_TYPES } from './cards.js';
import { calculateScore, getMatchingFieldCards } from './rules.js';

export class GoStopAI {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty;
  }

  /**
   * AI가 손패 중 낼 카드 1장 선택
   */
  chooseCardToPlay(hand, field, aiCollected, playerCollected) {
    if (!hand || hand.length === 0) return null;
    if (hand.length === 1) return hand[0];

    const scoredChoices = hand.map(card => {
      const matches = getMatchingFieldCards(card, field);
      let score = 0;

      if (matches.length === 0) {
        // 매칭되는 바닥 카드가 없을 때 (버려야 하는 경우)
        // 안전하게 단독 일반 피부터 버리기
        if (card.type === CARD_TYPES.PI) {
          score = -10;
        } else if (card.type === CARD_TYPES.TTI) {
          score = -30;
        } else if (card.type === CARD_TYPES.YEOL) {
          score = card.isGodori ? -80 : -50;
        } else if (card.isGwang) {
          score = -100; // 광은 웬만하면 버리지 않음
        } else if (card.type === CARD_TYPES.SSANG_PI || card.id === 'c09_cup') {
          score = -70; // 쌍피도 아낌
        }
      } else if (matches.length === 3) {
        // 3장이 깔려있어서 1장 내면 4장 싹쓸이!
        score = 250;
      } else {
        // 1장 또는 2장 매칭
        matches.forEach(m => {
          score += this.evaluateCardValue(m, aiCollected);
        });
        score += this.evaluateCardValue(card, aiCollected);
        
        // 뻑 위험 방지 (필드에 1장 있는데 내가 낼 때 살짝 가점)
        if (matches.length === 1) {
          score += 15;
        }
      }

      return { card, score };
    });

    // 가장 점수가 높은 카드 선택
    scoredChoices.sort((a, b) => b.score - a.score);
    return scoredChoices[0].card;
  }

  /**
   * 바닥에 동일한 월의 카드가 2장 있을 때 어느 것을 선택할지 결정
   */
  chooseFieldCard(matchingFieldCards, aiCollected) {
    if (matchingFieldCards.length <= 1) return matchingFieldCards[0];
    
    let bestCard = matchingFieldCards[0];
    let bestVal = -999;

    matchingFieldCards.forEach(card => {
      const val = this.evaluateCardValue(card, aiCollected);
      if (val > bestVal) {
        bestVal = val;
        bestCard = card;
      }
    });

    return bestCard;
  }

  /**
   * 카드의 전술적 가치 계산 (광 > 고도리 > 단/쌍피 > 피)
   */
  evaluateCardValue(card, collected) {
    let val = 10;

    if (card.isGwang) {
      val += 80;
      const gwangCount = collected.filter(c => c.isGwang).length;
      if (gwangCount >= 2) val += 50; // 3광/4광 눈앞
    }

    if (card.isGodori) {
      val += 60;
      const godoriCount = collected.filter(c => c.isGodori).length;
      if (godoriCount === 2) val += 70; // 고도리 완성 직전
    } else if (card.type === CARD_TYPES.YEOL) {
      val += 30;
    }

    if (card.subType === RIBBON_TYPES.HONGDAN ||
        card.subType === RIBBON_TYPES.CHEONGDAN ||
        card.subType === RIBBON_TYPES.CHODAN) {
      val += 40;
      const sameTti = collected.filter(c => c.subType === card.subType).length;
      if (sameTti === 2) val += 60; // 단 완성 직전
    } else if (card.type === CARD_TYPES.TTI) {
      val += 20;
    }

    if (card.type === CARD_TYPES.SSANG_PI || card.id === 'c09_cup') {
      val += 35;
    } else if (card.type === CARD_TYPES.PI) {
      val += 15;
    }

    return val;
  }

  /**
   * 7점 이상일 때 고(Go) 또는 스톱(Stop) 결정
   */
  decideGoOrStop(aiScore, playerScore, aiHand, drawDeckCount, currentGoCount) {
    // 3고 이상이면 대박이지만 위험도 급상승 -> 안전하게 스톱 고려
    if (currentGoCount >= 3) {
      return 'stop';
    }

    // 상대방 점수가 이미 4점 이상이면 고박 위험이 높음 -> 스톱!
    if (playerScore.finalScore >= 4) {
      return 'stop';
    }

    // 남은 손패가 적고 덱도 3장 이하인데 점수가 넉넉하면 스톱
    if (aiHand.length <= 2 || drawDeckCount <= 4) {
      return 'stop';
    }

    // 점수 차이가 크고 손패가 많이 남았으며 0고나 1고인 경우 적극적으로 Go!
    if (aiScore.finalScore >= 7 && currentGoCount === 0) {
      // 상대 점수가 0~2점이고 AI 손패에 유망한 카드가 있다면 Go
      if (playerScore.finalScore <= 2 && aiHand.length >= 4) {
        return 'go';
      }
    }

    // 기본적으로 1고 상태에서 손패가 넉넉하고 상대 점수가 낮으면 2고 도전
    if (currentGoCount === 1 && playerScore.finalScore <= 1 && aiHand.length >= 3) {
      return 'go';
    }

    return 'stop';
  }
}
