// 📁 server/grand-prix-socket.js
// Socket.io handler สำหรับ Grand Prix — Online multiplayer mode

module.exports = function (io) {
  // roomCode → RoomState
  const rooms = new Map();

  // ─── Question generation ──────────────────────────────────────────────────

  const TABLE_RANGES = {
    easy:   { min: 2, max: 5 },
    medium: { min: 6, max: 9 },
    hard:   { min: 10, max: 12 },
    all:    { min: 2, max: 12 }
  };

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generateChoices(a, b, correct) {
    const cands = new Set();
    if (a > 2) cands.add((a - 1) * b);
    cands.add((a + 1) * b);
    if (b > 2) cands.add(a * (b - 1));
    cands.add(a * (b + 1));
    cands.add((a + 1) * (b - 1));
    cands.add((a - 1) * (b + 1));
    // digit swap
    const s = String(correct);
    if (s.length === 2) cands.add(parseInt(s[1] + s[0], 10));
    cands.delete(correct);
    cands.delete(0);
    cands.delete(NaN);
    let wrong = shuffle([...cands].filter(n => n > 0 && n < 200)).slice(0, 3);
    // pad if needed
    let pad = 1;
    while (wrong.length < 3) { wrong.push(correct + pad * 7); pad++; }
    return shuffle([correct, ...wrong.slice(0, 3)]);
  }

  function pickType(gap) {
    // rubber band: คนที่ตามหลัง gap สูง → blue บ่อยขึ้น
    let blue, red, chaos;
    if (gap >= 11)     { blue = 42; red = 7; chaos = 6; }
    else if (gap >= 7) { blue = 35; red = 8; chaos = 7; }
    else if (gap >= 4) { blue = 28; red = 9; chaos = 8; }
    else if (gap >= 1) { blue = 22; red = 9; chaos = 9; }
    else               { blue = 20; red = 10; chaos = 10; } // leader
    const white = 100 - blue - red - chaos;
    const r = rand(1, 100);
    if (r <= white) return 'white';
    if (r <= white + blue) return 'blue';
    if (r <= white + blue + red) return 'red';
    return 'chaos';
  }

  function generateQuestion(tables, gap) {
    const range = TABLE_RANGES[tables] || TABLE_RANGES.all;
    const span = range.max - range.min;
    let minA = range.min, maxA = range.max;
    if (span >= 3) {
      if (gap === 0)     { minA = range.min + Math.floor(span * 0.4); }
      else if (gap >= 7) { maxA = range.min + Math.ceil(span * 0.6); }
    }
    const a = rand(minA, maxA);
    const b = rand(2, 12);
    const correct = a * b;
    const choices = generateChoices(a, b, correct);
    const type = pickType(gap);
    return { a, b, correct, choices, type, id: Math.random().toString(36).slice(2) };
  }

  function generateSpecialQuestion() {
    // Special event ใช้โจทย์ medium-hard เสมอ
    const a = rand(6, 12);
    const b = rand(6, 12);
    const correct = a * b;
    const choices = generateChoices(a, b, correct);
    // type สุ่มระหว่าง red กับ chaos
    const type = Math.random() < 0.5 ? 'red' : 'chaos';
    return { a, b, correct, choices, type, id: Math.random().toString(36).slice(2) };
  }

  // ─── Room helpers ─────────────────────────────────────────────────────────

  function createRoom(hostSocket, playerName, tables) {
    let code;
    do { code = Math.random().toString(36).slice(2, 8).toUpperCase(); }
    while (rooms.has(code));

    const room = {
      code,
      hostId: hostSocket.id,
      players: [{
        socketId: hostSocket.id,
        name: playerName || 'ผู้เล่น 1',
        color: 'red',
        position: 0,
        frozen: false,
        frozenTurns: 0,
        score: 0,
        correctCount: 0,
        totalAnswered: 0,
        currentQ: null
      }],
      tables: tables || 'all',
      state: 'lobby',   // lobby | countdown | playing | finished
      specialEvent: null,
      specialTimer: null,
      TRACK_LEN: 20,
      specialCooldown: 0  // questions since last special
    };
    rooms.set(code, room);
    return room;
  }

  function getLeaderPos(room) {
    return Math.max(...room.players.map(p => p.position));
  }

  function broadcastRoom(room) {
    io.to(room.code).emit('room:update', {
      players: room.players.map(p => ({
        socketId: p.socketId, name: p.name, color: p.color,
        position: p.position, frozen: p.frozen, score: p.score
      })),
      state: room.state
    });
  }

  function sendQuestion(room, player) {
    if (player.frozen && player.frozenTurns > 0) {
      player.frozenTurns--;
      if (player.frozenTurns <= 0) {
        player.frozen = false;
        io.to(player.socketId).emit('player:unfreeze');
      } else {
        // ส่ง frozen signal แทน question
        io.to(player.socketId).emit('player:frozen', { turnsLeft: player.frozenTurns });
        return;
      }
    }
    const leaderPos = getLeaderPos(room);
    const gap = leaderPos - player.position;
    const q = generateQuestion(room.tables, gap);
    player.currentQ = q;
    io.to(player.socketId).emit('question:new', { q, position: player.position });
  }

  function checkWin(room) {
    return room.players.find(p => p.position >= room.TRACK_LEN) || null;
  }

  function applyEffect(room, player, type) {
    if (type === 'white') {
      player.position = Math.min(player.position + 1, room.TRACK_LEN);
    } else if (type === 'blue') {
      player.position = Math.min(player.position + 2, room.TRACK_LEN);
    } else if (type === 'red') {
      // หยุดรถคนที่นำอยู่
      const leaderPos = getLeaderPos(room);
      const leader = room.players.find(p => p.socketId !== player.socketId && p.position === leaderPos);
      if (leader) {
        leader.frozen = true;
        leader.frozenTurns = 2;
        io.to(leader.socketId).emit('player:freeze', { turnsLeft: 2 });
      }
      player.position = Math.min(player.position + 1, room.TRACK_LEN); // ผู้ตอบเลื่อน 1
    } else if (type === 'chaos') {
      // สลับตำแหน่งเฉพาะกรณีที่มีคนอยู่หน้าผู้ตอบ
      const others = room.players.filter(p => p.socketId !== player.socketId);
      if (others.length > 0) {
        const ahead = others.filter(p => p.position > player.position);
        if (ahead.length > 0) {
          const target = ahead[Math.floor(Math.random() * ahead.length)];
          const tmp = player.position;
          player.position = target.position;
          target.position = tmp;
          io.to(room.code).emit('effect:swap', {
            p1: player.socketId, p2: target.socketId,
            pos1: player.position, pos2: target.position
          });
        } else {
          // ผู้ตอบนำอยู่แล้ว → เลื่อน +2
          player.position = Math.min(player.position + 2, room.TRACK_LEN);
        }
      }
    }
  }

  function triggerSpecialEvent(room) {
    if (room.specialEvent) return; // อยู่ระหว่าง special แล้ว
    const q = generateSpecialQuestion();
    room.specialEvent = { q, resolved: false };
    room.specialCooldown = 0;

    io.to(room.code).emit('special:event', {
      q: { a: q.a, b: q.b, choices: q.choices, type: q.type, id: q.id },
      timeout: 5000
    });

    // หมดเวลาก็ยกเลิก special
    room.specialTimer = setTimeout(() => {
      if (room.specialEvent && !room.specialEvent.resolved) {
        room.specialEvent = null;
        io.to(room.code).emit('special:timeout');
        // ส่ง question ต่อทุกคน
        room.players.forEach(p => sendQuestion(room, p));
      }
    }, 5500);
  }

  // ─── Socket events ────────────────────────────────────────────────────────

  io.on('connection', (socket) => {

    // สร้างห้อง (host)
    socket.on('room:create', ({ playerName, tables }) => {
      const room = createRoom(socket, playerName, tables);
      socket.join(room.code);
      socket.emit('room:created', { code: room.code, room: {
        players: room.players, state: room.state
      }});
    });

    // เข้าห้อง
    socket.on('room:join', ({ code, playerName }) => {
      const room = rooms.get(code?.toUpperCase());
      if (!room) return socket.emit('room:error', { error: 'ไม่พบห้อง' });
      if (room.state !== 'lobby') return socket.emit('room:error', { error: 'เกมเริ่มแล้ว' });
      if (room.players.length >= 4) return socket.emit('room:error', { error: 'ห้องเต็ม (สูงสุด 4 คน)' });

      const colors = ['red', 'blue', 'green', 'yellow'];
      const usedColors = room.players.map(p => p.color);
      const color = colors.find(c => !usedColors.includes(c)) || 'red';

      room.players.push({
        socketId: socket.id,
        name: playerName || `ผู้เล่น ${room.players.length + 1}`,
        color,
        position: 0,
        frozen: false,
        frozenTurns: 0,
        score: 0,
        correctCount: 0,
        totalAnswered: 0,
        currentQ: null
      });
      socket.join(code.toUpperCase());
      socket.emit('room:joined', { code: room.code, mySocketId: socket.id });
      broadcastRoom(room);
    });

    // host เริ่มเกม
    socket.on('game:start', ({ code }) => {
      const room = rooms.get(code?.toUpperCase());
      if (!room || room.hostId !== socket.id) return;
      if (room.players.length < 2) return socket.emit('room:error', { error: 'ต้องมีผู้เล่น 2 คนขึ้นไป' });

      room.state = 'countdown';
      io.to(room.code).emit('game:countdown', { seconds: 3 });

      setTimeout(() => {
        room.state = 'playing';
        broadcastRoom(room);
        room.players.forEach(p => sendQuestion(room, p));
      }, 3500);
    });

    // ผู้เล่นตอบคำถาม
    socket.on('answer:submit', ({ code, questionId, choiceIndex }) => {
      const room = rooms.get(code?.toUpperCase());
      if (!room || room.state !== 'playing') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || !player.currentQ || player.currentQ.id !== questionId) return;

      const q = player.currentQ;
      player.currentQ = null;
      player.totalAnswered++;
      room.specialCooldown++;

      const correct = q.choices[choiceIndex] === q.correct;

      if (correct) {
        player.correctCount++;
        player.score += q.type === 'blue' ? 3 : q.type === 'white' ? 1 : 1;
        applyEffect(room, player, q.type);

        broadcastRoom(room);

        const winner = checkWin(room);
        if (winner) {
          room.state = 'finished';
          const sorted = [...room.players].sort((a, b) => b.position - a.position);
          io.to(room.code).emit('game:over', {
            winner: winner.socketId,
            rankings: sorted.map((p, i) => ({
              rank: i + 1,
              socketId: p.socketId,
              name: p.name,
              color: p.color,
              position: p.position,
              correctCount: p.correctCount,
              totalAnswered: p.totalAnswered,
              score: p.score
            }))
          });
          rooms.delete(room.code);
          return;
        }

        // Trigger special event? (random ~20% เมื่อ cooldown ≥ 3)
        if (room.specialCooldown >= 3 && Math.random() < 0.20 && !room.specialEvent) {
          triggerSpecialEvent(room);
          return; // ไม่ส่ง question จนกว่า special จะจบ
        }
      } else {
        socket.emit('answer:wrong');
      }

      sendQuestion(room, player);
    });

    // ผู้เล่นตอบ special event (แย่งกัน)
    socket.on('special:answer', ({ code, questionId, choiceIndex }) => {
      const room = rooms.get(code?.toUpperCase());
      if (!room || !room.specialEvent || room.specialEvent.resolved) return;
      if (room.specialEvent.q.id !== questionId) return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      room.specialEvent.resolved = true;
      clearTimeout(room.specialTimer);

      const q = room.specialEvent.q;
      const correct = q.choices[choiceIndex] === q.correct;
      room.specialEvent = null;

      if (correct) {
        applyEffect(room, player, q.type);
        broadcastRoom(room);
        io.to(room.code).emit('special:resolved', {
          winnerId: socket.id,
          winnerName: player.name,
          correct: true,
          type: q.type
        });
      } else {
        io.to(room.code).emit('special:resolved', {
          winnerId: socket.id,
          winnerName: player.name,
          correct: false
        });
      }

      const winner = checkWin(room);
      if (winner) {
        room.state = 'finished';
        const sorted = [...room.players].sort((a, b) => b.position - a.position);
        io.to(room.code).emit('game:over', {
          winner: winner.socketId,
          rankings: sorted.map((p, i) => ({
            rank: i + 1, socketId: p.socketId, name: p.name, color: p.color,
            position: p.position, correctCount: p.correctCount,
            totalAnswered: p.totalAnswered, score: p.score
          }))
        });
        rooms.delete(room.code);
        return;
      }

      // ส่ง question ต่อทุกคน
      setTimeout(() => {
        room.players.forEach(p => sendQuestion(room, p));
      }, 1500);
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (const [code, room] of rooms) {
        const idx = room.players.findIndex(p => p.socketId === socket.id);
        if (idx === -1) continue;

        if (room.state === 'lobby') {
          room.players.splice(idx, 1);
          if (room.players.length === 0) {
            rooms.delete(code);
          } else {
            if (room.hostId === socket.id) room.hostId = room.players[0].socketId;
            broadcastRoom(room);
          }
        } else if (room.state === 'playing') {
          // Mark inactive แต่ไม่ลบ — เผื่อ reconnect
          room.players[idx].socketId = 'disconnected:' + socket.id;
          const activePlayers = room.players.filter(p => !p.socketId.startsWith('disconnected:'));
          if (activePlayers.length <= 1 && activePlayers.length > 0) {
            room.state = 'finished';
            io.to(code).emit('game:over', {
              winner: activePlayers[0].socketId,
              rankings: [{ rank: 1, ...activePlayers[0] }]
            });
            rooms.delete(code);
          }
        }
        break;
      }
    });
  });
};
