const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log(`Yeni oyuncu: ${socket.id}`);
  players[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, data: players[socket.id] });

  socket.on('movement', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('playerMoved', { id: socket.id, data: players[socket.id] });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Oyuncu ayrıldı: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Sunucu çalışıyor...');
});
