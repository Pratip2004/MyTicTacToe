
'use client'
import { useEffect, useState } from 'react';
import {io} from 'socket.io-client';
const socket = 
  io('http://localhost:3000',{
    withCredentials:true
      });

const IndexPage = () => {

  const [gameId, setGameId] = useState('');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState('');
  const [joinedGameId, setJoinedGameId] = useState('');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on('gameCreated', (newGameId) => {
      setGameId(newGameId);
       setIsGameStarted(true);
      setIsMyTurn(true); // The creator starts first
      setPlayerSymbol('X');
      console.log(`Game created with ID: ${newGameId}`);
    });

    socket.on('gameJoined', (joinedGameId) => {
      setGameId(joinedGameId);
      setIsGameStarted(true);
      setIsMyTurn(true); // The joiner goes second
      setPlayerSymbol('O');
      console.log(`Joined game with ID: ${joinedGameId}`);
    });

    socket.on('updateBoard', (newBoard) => {
      setBoard(newBoard);
      setIsMyTurn(!isMyTurn); // Toggle turn
      console.log('Board updated:', newBoard);
    });

    socket.on('gameOver', ({ winner, board }) => {
      setBoard(board);
      setWinner(winner);
      // setIsGameStarted(false);
      console.log(`Game over. Winner: ${winner}`);
    });
    socket.on('gameTie',({board})=>{
      setBoard(board);
     setWinner(null);
      
    })

    socket.on('error', (message) => {
      alert(message);
      console.log('Error:', message);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('updateBoard');
      socket.off('gameOver');
      socket.off('error');
    };
  }, []);

  const createGame = () => {
    console.log('Creating game...');
    socket.emit('createGame');
  };

  const joinGame = (id) => {
    console.log(`Joining game with ID: ${id}`);
    socket.emit('joinGame', id);
    setJoinedGameId("");
  };

  const makeMove = (index) => {
    if (isMyTurn && board[index] == null) {
      console.log(`Making move: gameId=${gameId}, index=${index},and the symbol is ${playerSymbol}`);
      socket.emit('makeMove', { gameId, index });
    } else {
      console.log('Invalid move attempt:', { isMyTurn, board, index });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsGameStarted(false);
    setIsMyTurn(false);
    setPlayerSymbol(null);
    setWinner(null);
  };
  const clickHandler=()=>{
    console.log("clicked");
    setIsGameStarted(false);
    setWinner(null)
    setBoard(Array(9).fill(null));
    setIsMyTurn(false);
    setPlayerSymbol(null);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!isGameStarted ? (
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={createGame}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
          >
            Create Game
          </button>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Join Game ID"
              value={joinedGameId}
              onChange={(e) => setJoinedGameId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded text-black"
            />
            <button
              onClick={() =>{ 
                joinGame(joinedGameId)
              }}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-700"
            >
              Join Game
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
            {winner ?(
            <div className='flex flex-col gap-3'>
               <div className="mt-4 text-5xl font-bold text-red-500">
              Winner: {winner}
              </div>
              <button  onClick={()=>{
                  clickHandler()
              }}className='mt-4 text-3xl font bold text-black border-2 border-black rounded-lg px-4 py-2'>
                    Start New Game
              </button>
            </div>
            
          ): 
           
          (
           <>
            <div className="mb-4 text-lg font-bold text-black">
            Game ID: {gameId}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {board.map((value, index) => (
              <button
                key={index}
                onClick={ ()=>{
                  makeMove(index)
                }}
                className="flex items-center justify-center w-24 h-24 text-2xl font-bold text-white bg-gray-800 rounded hover:bg-gray-600"
              >
                {value}
              </button>
            ))}
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-700"
          >
            Restart Game
          </button>
           </>
          )}
        
        </div>
      )}
    </div>
  );
};

export default IndexPage;
