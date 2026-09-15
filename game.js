// game.js - 맞고(2인 고스톱) 마스터 게임 엔진 및 UI 컨트롤러

import { CARDS_DATA, CARD_TYPES, renderCardHTML } from './cards.js';
import { dealCards, calculateScore, calculateEndScore, getMatchingFieldCards, takePiFromOpponent, WIN_SCORE } from './rules.js';
import { GoStopAI } from './ai.js';
import { sound } from './sound.js';
import { PeerMultiplayer } from './multiplayer.js';

class GoStopGame {
  constructor() {
    this.mode = 'AI'; // 'AI' | 'P2P_HOST' | 'P2P_GUEST'
    this.ai = new GoStopAI();
    this.multiplayer = null;

    // 게임 상태
    this.state = {
      p1Hand: [],
      p2Hand: [],
      field: [],
      drawDeck: [],
      p1Collected: [],
      p2Collected: [],
      p1GoCount: 0,
      p2GoCount: 0,
      p1LastScore: 0,
      p2LastScore: 0,
      currentTurn: 'p1', // 'p1' (유저/호스트), 'p2' (AI/게스트)
      isP1Gobak: false,
      isP2Gobak: false,
      statusMessage: '게임을 시작하세요.',
      isGameOver: false,
      selectedHandCard: null,
      pendingChoice: null // 2장 매칭 시 선택 대기
    };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.dom = {
      app: document.getElementById('game-app'),
      p1Area: document.getElementById('player1-area'),
      p2Area: document.getElementById('player2-area'),
      p1Hand: document.getElementById('p1-hand'),
      p2Hand: document.getElementById('p2-hand'),
      fieldGrid: document.getElementById('field-cards-grid'),
      deckCount: document.getElementById('deck-count'),
      p1Score: document.getElementById('p1-score'),
      p2Score: document.getElementById('p2-score'),
      p1GoBadge: document.getElementById('p1-go-badge'),
      p2GoBadge: document.getElementById('p2-go-badge'),
      p1Gwang: document.getElementById('p1-gwang'),
      p1Yeol: document.getElementById('p1-yeol'),
      p1Tti: document.getElementById('p1-tti'),
      p1Pi: document.getElementById('p1-pi'),
      p2Gwang: document.getElementById('p2-gwang'),
      p2Yeol: document.getElementById('p2-yeol'),
      p2Tti: document.getElementById('p2-tti'),
      p2Pi: document.getElementById('p2-pi'),
      statusToast: document.getElementById('status-toast'),
      // 모달 엘리먼트들
      lobbyModal: document.getElementById('lobby-modal'),
      goStopModal: document.getElementById('go-stop-modal'),
      choiceModal: document.getElementById('field-choice-modal'),
      choiceCards: document.getElementById('choice-cards-container'),
      resultModal: document.getElementById('result-modal'),
      resultTitle: document.getElementById('result-title'),
      resultTable: document.getElementById('result-table'),
      rulesModal: document.getElementById('rules-modal')
    };
  }

  bindEvents() {
    // 사운드 토글
    document.getElementById('btn-sound').addEventListener('click', (e) => {
      const enabled = sound.toggleSound();
      e.currentTarget.textContent = enabled ? '🔊 사운드 ON' : '🔇 사운드 OFF';
    });

    // 게임 모드 및 로비 버튼
    document.getElementById('btn-lobby').addEventListener('click', () => {
      this.showModal(this.dom.lobbyModal);
    });

    document.getElementById('btn-rules').addEventListener('click', () => {
      this.showModal(this.dom.rulesModal);
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // AI 모드 시작
    document.getElementById('btn-mode-ai').addEventListener('click', () => {
      this.mode = 'AI';
      document.getElementById('p2-name').textContent = '인공지능 (AI)';
      this.closeAllModals();
      this.startNewGame();
    });

    // PeerJS 멀티플레이어 바인딩
    this.setupMultiplayerControls();

    // 고 / 스톱 모달 버튼
    document.getElementById('btn-go').addEventListener('click', () => {
      this.handleGoChoice(true);
    });
    document.getElementById('btn-stop').addEventListener('click', () => {
      this.handleGoChoice(false);
    });

    // 재도전 버튼
    document.getElementById('btn-restart').addEventListener('click', () => {
      this.closeAllModals();
      if (this.mode === 'P2P_GUEST') {
        this.multiplayer.send({ type: 'REQUEST_RESTART' });
      } else {
        this.startNewGame();
      }
    });
  }

  setupMultiplayerControls() {
    const roomInput = document.getElementById('input-room-code');
    const customServerToggle = document.getElementById('toggle-custom-server');
    const customServerInputs = document.getElementById('custom-server-inputs');

    customServerToggle.addEventListener('change', (e) => {
      customServerInputs.style.display = e.target.checked ? 'block' : 'none';
    });

    const getServerConfig = () => {
      if (customServerToggle.checked) {
        return {
          useCloud: false,
          host: document.getElementById('input-server-host').value.trim() || 'localhost',
          port: document.getElementById('input-server-port').value.trim() || '9000',
          path: document.getElementById('input-server-path').value.trim() || '/'
        };
      }
      return { useCloud: true };
    };

    // 방 만들기 버튼
    document.getElementById('btn-create-room').addEventListener('click', () => {
      const code = roomInput.value.trim() || Math.random().toString(36).substring(2, 8);
      roomInput.value = code;
      this.mode = 'P2P_HOST';
      this.initPeerConnection(true, code, getServerConfig());
    });

    // 방 접속 버튼
    document.getElementById('btn-join-room').addEventListener('click', () => {
      const code = roomInput.value.trim();
      if (!code) {
        alert('접속할 방 코드를 입력하세요!');
        return;
      }
      this.mode = 'P2P_GUEST';
      this.initPeerConnection(false, code, getServerConfig());
    });
  }

  initPeerConnection(isHost, roomCode, serverConfig) {
    if (this.multiplayer) {
      this.multiplayer.destroy();
    }

    this.multiplayer = new PeerMultiplayer({
      onStatus: (msg) => {
        this.showToast(msg);
      },
      onConnected: (info) => {
        this.closeAllModals();
        document.getElementById('p2-name').textContent = isHost ? '원격 상대방' : '방장 (Host)';
        if (isHost) {
          this.startNewGame();
        }
      },
      onData: (data) => {
        this.handlePeerData(data);
      },
      onError: (err) => {
        this.showToast(`[P2P 오류] ${err.message || err.type}`);
      }
    });

    if (isHost) {
      this.multiplayer.createRoom(roomCode, serverConfig);
    } else {
      this.multiplayer.joinRoom(roomCode, serverConfig);
    }
  }

  handlePeerData(data) {
    switch (data.type) {
      case 'SYNC_STATE':
        this.state = data.state;
        this.renderAll();
        break;
      case 'GUEST_PLAY_CARD':
        if (this.mode === 'P2P_HOST') {
          this.playHandCard('p2', data.cardId, data.chosenFieldCardId);
        }
        break;
      case 'GUEST_GO_STOP':
        if (this.mode === 'P2P_HOST') {
          this.handleGoChoice(data.isGo);
        }
        break;
      case 'REQUEST_RESTART':
        if (this.mode === 'P2P_HOST') {
          this.startNewGame();
        }
        break;
    }
  }

  syncStateToGuest() {
    if (this.mode === 'P2P_HOST' && this.multiplayer) {
      this.multiplayer.send({
        type: 'SYNC_STATE',
        state: this.state
      });
    }
  }

  startNewGame() {
    sound.playShuffle();
    const deal = dealCards();
    this.state = {
      p1Hand: deal.p1Hand,
      p2Hand: deal.p2Hand,
      field: deal.field,
      drawDeck: deal.drawDeck,
      p1Collected: [],
      p2Collected: [],
      p1GoCount: 0,
      p2GoCount: 0,
      p1LastScore: 0,
      p2LastScore: 0,
      currentTurn: 'p1',
      isP1Gobak: false,
      isP2Gobak: false,
      statusMessage: '내 차례입니다. 낼 화투패를 선택하세요.',
      isGameOver: false,
      selectedHandCard: null,
      pendingChoice: null
    };

    this.renderAll();
    this.showToast('새 판이 시작되었습니다! (선: 플레이어)');
    this.syncStateToGuest();
  }

  /**
   * 유저의 손패 카드 클릭 처리
   */
  onPlayerCardClick(cardId) {
    if (this.state.isGameOver) return;

    // 게스트 모드일 때는 호스트에게 요청 전송
    if (this.mode === 'P2P_GUEST') {
      if (this.state.currentTurn !== 'p2') {
        this.showToast('아직 상대방의 차례입니다.');
        return;
      }
      this.handleCardSelection(cardId, 'p2');
      return;
    }

    // AI 모드 및 호스트 모드
    if (this.state.currentTurn !== 'p1') {
      this.showToast('상대방이 생각 중입니다.');
      return;
    }

    this.handleCardSelection(cardId, 'p1');
  }

  handleCardSelection(cardId, playerKey) {
    const hand = playerKey === 'p1' ? this.state.p1Hand : this.state.p2Hand;
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    const matchingField = getMatchingFieldCards(card, this.state.field);

    if (matchingField.length === 2) {
      // 바닥에 2장 있어서 사용자가 하나를 선택해야 하는 경우
      this.promptFieldChoice(card, matchingField, (chosenFieldCard) => {
        if (this.mode === 'P2P_GUEST') {
          this.multiplayer.send({
            type: 'GUEST_PLAY_CARD',
            cardId: card.id,
            chosenFieldCardId: chosenFieldCard.id
          });
        } else {
          this.playHandCard(playerKey, card.id, chosenFieldCard.id);
        }
      });
    } else {
      // 0장, 1장 또는 3장 (모두 자동 처리)
      if (this.mode === 'P2P_GUEST') {
        this.multiplayer.send({
          type: 'GUEST_PLAY_CARD',
          cardId: card.id,
          chosenFieldCardId: null
        });
      } else {
        this.playHandCard(playerKey, card.id, null);
      }
    }
  }

  /**
   * 화투패 내기 및 덱 뒤집기 메인 로직 (호스트/AI 권한 실행)
   */
  playHandCard(playerKey, handCardId, chosenFieldCardId = null) {
    const hand = playerKey === 'p1' ? this.state.p1Hand : this.state.p2Hand;
    const cardIndex = hand.findIndex(c => c.id === handCardId);
    if (cardIndex === -1) return;

    const [playedCard] = hand.splice(cardIndex, 1);
    sound.playSnap();

    // 1단계: 낸 손패와 바닥 패 매칭
    const matchingField = getMatchingFieldCards(playedCard, this.state.field);
    let handMatchedCards = [];

    if (matchingField.length === 0) {
      // 맞추는 패가 없으면 바닥에 깔림
      this.state.field.push(playedCard);
    } else if (matchingField.length === 1) {
      // 1장 매칭
      const matched = matchingField[0];
      this.removeCardFromField(matched.id);
      handMatchedCards = [playedCard, matched];
    } else if (matchingField.length === 2) {
      // 2장 중 하나 선택된 패와 매칭
      const targetId = chosenFieldCardId || matchingField[0].id;
      const matched = matchingField.find(c => c.id === targetId) || matchingField[0];
      this.removeCardFromField(matched.id);
      handMatchedCards = [playedCard, matched];
    } else if (matchingField.length === 3) {
      // 바닥에 3장(산)이 깔려있을 때 내면 4장 싹쓸이!
      matchingField.forEach(c => this.removeCardFromField(c.id));
      handMatchedCards = [playedCard, ...matchingField];
      this.showToast('💥 싹쓸이! (상대 피 1장 뺏기)');
      sound.playBonus();
      this.stealPi(playerKey);
    }

    // 2단계: 더미 덱에서 1장 뒤집기
    setTimeout(() => {
      if (this.state.drawDeck.length === 0) {
        this.finishTurn(playerKey, handMatchedCards, []);
        return;
      }

      sound.playFlip();
      const flippedCard = this.state.drawDeck.pop();
      const deckMatchingField = getMatchingFieldCards(flippedCard, this.state.field);
      let deckMatchedCards = [];

      // 특수 상황 체크 (뻑, 쪽, 따닥)
      if (handMatchedCards.length > 0 && deckMatchingField.some(c => c.month === playedCard.month)) {
        // [뻑(설사)]: 내가 낸 월과 덱에서 뒤집은 월이 일치하여 바닥에 놓임
        this.showToast('💩 뻑! (모든 카드가 바닥에 남습니다)');
        sound.playBonus();
        // 손패로 맞췄던 카드들과 뒤집은 카드 모두 다시 바닥에 등록
        this.state.field.push(...handMatchedCards, flippedCard);
        handMatchedCards = [];
      } else if (deckMatchingField.length === 0) {
        // 뒤집은 카드가 바닥에 매칭되는 게 없음
        this.state.field.push(flippedCard);
      } else if (deckMatchingField.length === 1) {
        const matched = deckMatchingField[0];
        // [쪽] 체크: 손패는 못 맞췄는데(바닥에 냄), 뒤집은 카드가 방금 낸 손패와 짝이 됨!
        if (handMatchedCards.length === 0 && matched.id === playedCard.id) {
          this.showToast('💋 쪽! (상대 피 1장 뺏기)');
          sound.playBonus();
          this.stealPi(playerKey);
        }
        // [따닥] 체크: 손패로도 먹고, 뒤집은 카드도 바닥에 깔린 것과 딱 맞음
        if (handMatchedCards.length > 0 && matched.month === flippedCard.month) {
          this.showToast('⚡ 따닥! (상대 피 1장 뺏기)');
          sound.playBonus();
          this.stealPi(playerKey);
        }

        this.removeCardFromField(matched.id);
        deckMatchedCards = [flippedCard, matched];
      } else if (deckMatchingField.length >= 2) {
        // AI 또는 첫 번째 카드로 자동 획득
        const matched = deckMatchingField[0];
        this.removeCardFromField(matched.id);
        deckMatchedCards = [flippedCard, matched];
      }

      // [싹쓸이] 체크: 바닥이 깨끗이 비었을 때
      if (this.state.field.length === 0) {
        this.showToast('🌪️ 싹쓸이! (상대 피 1장 뺏기)');
        sound.playBonus();
        this.stealPi(playerKey);
      }

      this.finishTurn(playerKey, handMatchedCards, deckMatchedCards);
    }, 350);
  }

  removeCardFromField(cardId) {
    const idx = this.state.field.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      this.state.field.splice(idx, 1);
    }
  }

  stealPi(beneficiaryKey) {
    const victimKey = beneficiaryKey === 'p1' ? 'p2' : 'p1';
    const victimCollected = victimKey === 'p1' ? this.state.p1Collected : this.state.p2Collected;
    const stolen = takePiFromOpponent(victimCollected);
    if (stolen) {
      const beneficiaryCollected = beneficiaryKey === 'p1' ? this.state.p1Collected : this.state.p2Collected;
      beneficiaryCollected.push(stolen);
    }
  }

  finishTurn(playerKey, handMatched, deckMatched) {
    const playerCollected = playerKey === 'p1' ? this.state.p1Collected : this.state.p2Collected;
    playerCollected.push(...handMatched, ...deckMatched);

    this.renderAll();
    this.syncStateToGuest();

    // 점수 계산
    const goCount = playerKey === 'p1' ? this.state.p1GoCount : this.state.p2GoCount;
    const lastScore = playerKey === 'p1' ? this.state.p1LastScore : this.state.p2LastScore;
    const currentScore = calculateScore(playerCollected, goCount);

    // 고 / 스톱 조건 (7점 이상 도달 및 직전 고 선언 시점보다 점수 상승)
    if (currentScore.finalScore >= WIN_SCORE && currentScore.finalScore > lastScore) {
      if (playerKey === 'p1' || (playerKey === 'p2' && this.mode === 'P2P_GUEST')) {
        // 사람이 직접 고/스톱 선택
        this.promptGoOrStop(currentScore);
        return;
      } else if (playerKey === 'p2' && this.mode === 'AI') {
        // AI의 고/스톱 결정
        setTimeout(() => {
          const p1Score = calculateScore(this.state.p1Collected, this.state.p1GoCount);
          const decision = this.ai.decideGoOrStop(
            currentScore,
            p1Score,
            this.state.p2Hand,
            this.state.drawDeck.length,
            this.state.p2GoCount
          );

          if (decision === 'go') {
            this.handleGoChoice(true, 'p2');
          } else {
            this.handleGoChoice(false, 'p2');
          }
        }, 600);
        return;
      }
    }

    // 패 소진 여부 확인
    if (this.state.p1Hand.length === 0 && this.state.p2Hand.length === 0) {
      this.endGameAsDraw();
      return;
    }

    // 턴 교대
    this.state.currentTurn = playerKey === 'p1' ? 'p2' : 'p1';
    this.renderTurnIndicator();
    this.syncStateToGuest();

    // AI 차례인 경우 자동 실행
    if (this.state.currentTurn === 'p2' && this.mode === 'AI' && !this.state.isGameOver) {
      setTimeout(() => {
        this.executeAITurn();
      }, 700);
    }
  }

  executeAITurn() {
    if (this.state.p2Hand.length === 0) return;
    const cardToPlay = this.ai.chooseCardToPlay(
      this.state.p2Hand,
      this.state.field,
      this.state.p2Collected,
      this.state.p1Collected
    );

    if (cardToPlay) {
      const matches = getMatchingFieldCards(cardToPlay, this.state.field);
      let chosenFieldCard = null;
      if (matches.length === 2) {
        chosenFieldCard = this.ai.chooseFieldCard(matches, this.state.p2Collected);
      }
      this.playHandCard('p2', cardToPlay.id, chosenFieldCard ? chosenFieldCard.id : null);
    }
  }

  promptGoOrStop(scoreInfo) {
    document.getElementById('current-score-display').textContent = `${scoreInfo.finalScore}점`;
    this.showModal(this.dom.goStopModal);
  }

  handleGoChoice(isGo, overridePlayer = null) {
    this.closeAllModals();
    const playerKey = overridePlayer || this.state.currentTurn;

    if (isGo) {
      sound.playGo();
      if (playerKey === 'p1') {
        this.state.p1GoCount += 1;
        const sc = calculateScore(this.state.p1Collected, this.state.p1GoCount);
        this.state.p1LastScore = sc.finalScore;
        this.showToast(`🔥 플레이어 ${this.state.p1GoCount}고(GO) 선언!`);
      } else {
        this.state.p2GoCount += 1;
        const sc = calculateScore(this.state.p2Collected, this.state.p2GoCount);
        this.state.p2LastScore = sc.finalScore;
        this.showToast(`🔥 상대방 ${this.state.p2GoCount}고(GO) 선언!`);
      }

      // 턴 넘기기
      this.state.currentTurn = playerKey === 'p1' ? 'p2' : 'p1';
      this.renderAll();
      this.syncStateToGuest();

      if (this.state.currentTurn === 'p2' && this.mode === 'AI') {
        setTimeout(() => this.executeAITurn(), 700);
      }
    } else {
      // 스톱 (게임 종료)
      sound.playStop();
      this.endGameWithWinner(playerKey);
    }
  }

  endGameWithWinner(winnerKey) {
    this.state.isGameOver = true;
    sound.playWin();

    const isP1Winner = winnerKey === 'p1';
    const winnerName = isP1Winner ? '플레이어 (나)' : (this.mode === 'AI' ? '인공지능 (AI)' : '상대방');
    const winnerCollected = isP1Winner ? this.state.p1Collected : this.state.p2Collected;
    const loserCollected = isP1Winner ? this.state.p2Collected : this.state.p1Collected;
    const winnerGoCount = isP1Winner ? this.state.p1GoCount : this.state.p2GoCount;
    const isLoserGobak = isP1Winner ? (this.state.p2GoCount > 0) : (this.state.p1GoCount > 0);

    const breakdown = calculateScore(winnerCollected, winnerGoCount);
    const endResult = calculateEndScore(breakdown, loserCollected, isLoserGobak);

    this.dom.resultTitle.textContent = `${winnerName} 승리! 🏆`;
    this.dom.resultTable.innerHTML = `
      <div class="summary-row"><span>기본 점수</span><span>${endResult.baseScore}점</span></div>
      ${breakdown.gwangDesc ? `<div class="summary-row"><span>광</span><span>${breakdown.gwangDesc}</span></div>` : ''}
      ${breakdown.yeolDesc ? `<div class="summary-row"><span>열끗</span><span>${breakdown.yeolDesc}</span></div>` : ''}
      ${breakdown.ttiDesc ? `<div class="summary-row"><span>띠</span><span>${breakdown.ttiDesc}</span></div>` : ''}
      ${breakdown.pi > 0 ? `<div class="summary-row"><span>피 (${breakdown.piCount}장)</span><span>${breakdown.pi}점</span></div>` : ''}
      ${endResult.goCount > 0 ? `<div class="summary-row"><span>고 횟수</span><span>${endResult.goCount}고</span></div>` : ''}
      ${endResult.penalties.length > 0 ? `<div class="summary-row" style="color: #ef4444;"><span>배판/박 적용</span><span>${endResult.penalties.join(', ')}</span></div>` : ''}
      <div class="summary-row"><span>최종 결산 점수</span><span>${endResult.finalScore}점</span></div>
    `;

    this.showModal(this.dom.resultModal);
    this.syncStateToGuest();
  }

  endGameAsDraw() {
    this.state.isGameOver = true;
    this.dom.resultTitle.textContent = '나가리 (무승부) 🤝';
    this.dom.resultTable.innerHTML = `
      <div class="summary-row">
        <span>결과</span>
        <span>양 플레이어 모두 7점 미만으로 판이 끝났습니다. 다음 판은 2배!</span>
      </div>
    `;
    this.showModal(this.dom.resultModal);
    this.syncStateToGuest();
  }

  promptFieldChoice(playedCard, matchingCards, callback) {
    this.dom.choiceCards.innerHTML = matchingCards.map(c => renderCardHTML(c)).join('');
    this.showModal(this.dom.choiceModal);

    const cardsEl = this.dom.choiceCards.querySelectorAll('.hwatu-card');
    cardsEl.forEach((el, index) => {
      el.addEventListener('click', () => {
        this.closeAllModals();
        callback(matchingCards[index]);
      });
    });
  }

  renderAll() {
    this.renderHands();
    this.renderField();
    this.renderCollectedTrays();
    this.renderScores();
    this.renderTurnIndicator();
  }

  renderHands() {
    // 1. 내 손패 (P1)
    this.dom.p1Hand.innerHTML = this.state.p1Hand.map(c => renderCardHTML(c)).join('');
    this.dom.p1Hand.querySelectorAll('.hwatu-card').forEach(el => {
      const cardId = el.getAttribute('data-card-id');
      const month = parseInt(el.getAttribute('data-month'), 10);

      // 호버 시 바닥의 동일 월 카드 강조
      el.addEventListener('mouseenter', () => {
        this.highlightMatchingFieldCards(month, true);
      });
      el.addEventListener('mouseleave', () => {
        this.highlightMatchingFieldCards(month, false);
      });

      // 클릭 시 패 내기
      el.addEventListener('click', () => {
        this.onPlayerCardClick(cardId);
      });
    });

    // 2. 상대방 손패 (P2)
    // 게스트 모드일 때 내가 P2이면 P2패를 앞면으로, P1패를 뒷면으로 보여줌
    if (this.mode === 'P2P_GUEST') {
      this.dom.p1Hand.innerHTML = this.state.p1Hand.map(() => renderCardHTML({}, true)).join('');
      this.dom.p2Hand.innerHTML = this.state.p2Hand.map(c => renderCardHTML(c)).join('');
      this.dom.p2Hand.querySelectorAll('.hwatu-card').forEach(el => {
        const cardId = el.getAttribute('data-card-id');
        el.addEventListener('click', () => this.onPlayerCardClick(cardId));
      });
    } else {
      this.dom.p2Hand.innerHTML = this.state.p2Hand.map(() => renderCardHTML({}, true)).join('');
    }
  }

  highlightMatchingFieldCards(month, isHighlight) {
    const fieldCards = this.dom.fieldGrid.querySelectorAll(`.hwatu-card[data-month="${month}"]`);
    fieldCards.forEach(c => {
      if (isHighlight) {
        c.classList.add('highlight-match');
      } else {
        c.classList.remove('highlight-match');
      }
    });
  }

  renderField() {
    // 바닥 카드 렌더링 (월별로 그루핑하여 시각적으로 겹치게 표시)
    const grouped = {};
    this.state.field.forEach(c => {
      if (!grouped[c.month]) grouped[c.month] = [];
      grouped[c.month].push(c);
    });

    let html = '';
    Object.values(grouped).forEach(pile => {
      if (pile.length === 1) {
        html += renderCardHTML(pile[0]);
      } else {
        html += `<div class="field-pile">
          ${pile.map(c => renderCardHTML(c)).join('')}
        </div>`;
      }
    });

    this.dom.fieldGrid.innerHTML = html;
    this.dom.deckCount.textContent = `${this.state.drawDeck.length}장 남음`;
  }

  renderCollectedTrays() {
    const renderTray = (collected, gwangEl, yeolEl, ttiEl, piEl) => {
      const gwang = collected.filter(c => c.isGwang);
      const yeol = collected.filter(c => c.type === CARD_TYPES.YEOL);
      const tti = collected.filter(c => c.type === CARD_TYPES.TTI);
      const pi = collected.filter(c => c.type === CARD_TYPES.PI || c.type === CARD_TYPES.SSANG_PI || c.id === 'c09_cup');

      const stackCards = (cards) => {
        return cards.map((c, i) => `
          <div style="transform: translateX(${i * 14}px); z-index: ${i}; position: absolute;">
            ${renderCardHTML(c)}
          </div>
        `).join('');
      };

      gwangEl.innerHTML = stackCards(gwang);
      yeolEl.innerHTML = stackCards(yeol);
      ttiEl.innerHTML = stackCards(tti);
      piEl.innerHTML = stackCards(pi);
    };

    renderTray(this.state.p1Collected, this.dom.p1Gwang, this.dom.p1Yeol, this.dom.p1Tti, this.dom.p1Pi);
    renderTray(this.state.p2Collected, this.dom.p2Gwang, this.dom.p2Yeol, this.dom.p2Tti, this.dom.p2Pi);
  }

  renderScores() {
    const sc1 = calculateScore(this.state.p1Collected, this.state.p1GoCount);
    const sc2 = calculateScore(this.state.p2Collected, this.state.p2GoCount);

    this.dom.p1Score.textContent = `${sc1.finalScore}점`;
    this.dom.p2Score.textContent = `${sc2.finalScore}점`;

    this.dom.p1GoBadge.textContent = `${this.state.p1GoCount}고`;
    this.dom.p1GoBadge.style.display = this.state.p1GoCount > 0 ? 'inline-block' : 'none';

    this.dom.p2GoBadge.textContent = `${this.state.p2GoCount}고`;
    this.dom.p2GoBadge.style.display = this.state.p2GoCount > 0 ? 'inline-block' : 'none';
  }

  renderTurnIndicator() {
    const isP1 = this.state.currentTurn === 'p1';
    this.dom.p1Area.classList.toggle('active-turn', isP1);
    this.dom.p2Area.classList.toggle('active-turn', !isP1);
  }

  showToast(msg) {
    this.dom.statusToast.textContent = msg;
    this.dom.statusToast.style.opacity = '1';
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.dom.statusToast.style.opacity = '0.85';
    }, 2500);
  }

  showModal(modalEl) {
    modalEl.classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
}

// 초기화
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GoStopGame();
  // 자동 첫 판 시작
  window.game.startNewGame();
});
