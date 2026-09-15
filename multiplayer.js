// multiplayer.js - PeerJS 기반 실시간 2인 P2P 멀티플레이어 통신 모듈

export class PeerMultiplayer {
  constructor(callbacks = {}) {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = '';
    this.callbacks = {
      onConnected: () => {},
      onDisconnected: () => {},
      onData: () => {},
      onError: () => {},
      onStatus: () => {},
      ...callbacks
    };
  }

  /**
   * PeerJS 인스턴스 생성
   * @param {string|null} customId 
   * @param {object} serverConfig { useCloud: true } 또는 { host, port, path }
   */
  initPeer(customId = null, serverConfig = { useCloud: true }) {
    if (this.peer) {
      this.destroy();
    }

    let options = {};
    if (serverConfig && !serverConfig.useCloud && serverConfig.host) {
      options = {
        host: serverConfig.host,
        port: parseInt(serverConfig.port, 10) || 9000,
        path: serverConfig.path || '/',
        secure: serverConfig.secure || false
      };
    }

    if (customId) {
      this.peer = new window.Peer(customId, options);
    } else {
      this.peer = new window.Peer(options);
    }

    this.peer.on('error', (err) => {
      console.error('[PeerJS Error]', err);
      this.callbacks.onError(err);
    });

    return this.peer;
  }

  /**
   * 방 만들기 (호스트)
   */
  createRoom(roomCode, serverConfig) {
    this.isHost = true;
    this.roomCode = roomCode.trim().toLowerCase();
    const peerId = `gostop-${this.roomCode}`;

    this.callbacks.onStatus(`방 생성 중... (코드: ${this.roomCode})`);

    this.initPeer(peerId, serverConfig);

    this.peer.on('open', (id) => {
      this.callbacks.onStatus(`방이 개설되었습니다! 상대방에게 방 코드를 공유하세요: ${this.roomCode}`);
    });

    this.peer.on('connection', (conn) => {
      if (this.conn) {
        // 이미 2명이 찬 경우 거절
        conn.close();
        return;
      }
      this.conn = conn;
      this.setupConnectionHandlers();
    });
  }

  /**
   * 방 입장하기 (게스트)
   */
  joinRoom(roomCode, serverConfig) {
    this.isHost = false;
    this.roomCode = roomCode.trim().toLowerCase();
    const hostPeerId = `gostop-${this.roomCode}`;

    this.callbacks.onStatus(`방 접속 시도 중... (${this.roomCode})`);

    this.initPeer(null, serverConfig);

    this.peer.on('open', (id) => {
      this.callbacks.onStatus(`호스트(${this.roomCode})에게 연결하는 중...`);
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.conn = conn;
      this.setupConnectionHandlers();
    });
  }

  /**
   * 데이터 채널 이벤트 설정
   */
  setupConnectionHandlers() {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.callbacks.onConnected({
        isHost: this.isHost,
        roomCode: this.roomCode
      });
      this.callbacks.onStatus(`상대방과 성공적으로 연결되었습니다! 게임을 시작합니다.`);
    });

    this.conn.on('data', (data) => {
      this.callbacks.onData(data);
    });

    this.conn.on('close', () => {
      this.callbacks.onDisconnected();
      this.callbacks.onStatus('상대방과의 연결이 끊어졌습니다.');
      this.conn = null;
    });

    this.conn.on('error', (err) => {
      console.error('[Connection Error]', err);
      this.callbacks.onError(err);
    });
  }

  /**
   * 상대방에게 메시지 전송
   */
  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  }

  /**
   * 연결 종료 및 정리
   */
  destroy() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
