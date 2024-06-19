import express from 'express';
import { createServer} from 'http';
import {Server} from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const PORT=3000;
nextApp.prepare().then(() => {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

let games = {};

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const calculateWinner = (board) => {
  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('createGame', () => {
    const gameId = Math.random().toString(36).substring(2,9);
    games[gameId] = {
      players: [socket.id],
      board: Array(9).fill(null),
      currentPlayer: socket.id,
    };
    socket.join(gameId);
    socket.emit('gameCreated', gameId);
    console.log(`Game created with ID: ${gameId}`);
  });

  socket.on('joinGame', (gameId) => {
    const game=games[gameId];
    if (game && game.players.length < 2) {
      game.players.push(socket.id);
      socket.join(gameId);
      io.to(gameId).emit('gameJoined', gameId);
      console.log(`Player joined game with ID: ${gameId}`);
    } else {
      socket.emit('error', 'Game not found or already full');
      console.log('Game join failed');
    }
  });

  socket.on('makeMove', ({ gameId, index }) => {
    const game = games[gameId];
    console.log(game.currentPlayer)
    console.log(socket.id)
    if (game && game.board[index] === null && socket.id === game.currentPlayer) {
      const symbol = game.players.indexOf(socket.id) === 0 ? 'X' : 'O';
      game.board[index] = symbol;
      const winner = calculateWinner(game.board);
      if (winner) {
        io.to(gameId).emit('gameOver', { winner, board: game.board });
        delete games[gameId];
        console.log(`Game over. Winner: ${winner}`);
      } else {
        game.currentPlayer = game.players[(game.players.indexOf(socket.id) + 1) % 2];
        io.to(gameId).emit('updateBoard', game.board);
        console.log(`Move made in game ${gameId} at index ${index} by ${socket.id} and the symbol is ${symbol}`);
      }
    }
    else if(game && game.board[index]!==null){
      const winner=calculateWinner(game.board);
      // if (winner) {
      //   io.to(gameId).emit('gameOver', { winner, board: game.board });
      //   delete games[gameId];
      //   console.log(`Game over. Winner: ${winner}`);
      // }
        if(!winner){
          io.to(gameId).emit('gameTie',{board:game.board});
          delete games[gameId];
        } 
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    for (let gameId in games) {
      const game = games[gameId];
      if (game.players.includes(socket.id)) {
        delete games[gameId];
        io.to(gameId).emit('error', 'Player disconnected. Game over.');
        console.log(`Game ${gameId} ended due to player disconnection`);
        break;
      }
    }
  });
});


app.all('*', (req, res) => {
  return handle(req, res);
});

server.listen(3000, (err) => {
  if (err) throw err;
  console.log('> Ready on http://localhost:3000');
});
});
