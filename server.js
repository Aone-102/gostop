// server.js - 로컬 실행용 Node.js 정적 웹서버 + PeerJS 시그널링 서버
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 9000;

// 정적 파일 MIME 타입 매핑
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 1. 정적 파일 서빙 HTTP 서버 생성
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

// 2. PeerJS 서버 인스턴스 연동
try {
  const { ExpressPeerServer } = require('peer');
  // Express 없이 독립 peerjs 서버로 구동
  const { PeerServer } = require('peer');
  
  const peerServer = PeerServer({
    port: 9001,
    path: '/',
    allow_discovery: true
  });

  peerServer.on('connection', (client) => {
    console.log(`[PeerJS] 클라이언트 연결: ${client.getId()}`);
  });

  peerServer.on('disconnect', (client) => {
    console.log(`[PeerJS] 클라이언트 퇴장: ${client.getId()}`);
  });

  console.log(`🚀 [PeerJS 시그널링 서버] ws://localhost:9001 구동 완료`);
} catch (e) {
  console.log('ℹ️ npm install peer express 가 아직 실행되지 않았습니다.');
  console.log('브라우저에서는 PeerJS 무료 공식 클라우드 서버(0.peerjs.com)로 즉시 P2P 연결이 가능합니다!');
}

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎴 고스톱(맞고) 웹 게임 서버가 시작되었습니다!`);
  console.log(`👉 브라우저 주소: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
