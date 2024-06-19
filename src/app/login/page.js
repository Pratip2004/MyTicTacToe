// pages/index.js
'use client'
import { useState } from 'react';

const IndexPage = () => {
  const [board, setBoard] = useState(Array(9).fill(null));

  const handleClick = (index) => {
    const newBoard = [...board];
    newBoard[index] = newBoard[index] ? 'O' : 'X'; // Toggle between null and 'X' for demonstration
    setBoard(newBoard);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-3 gap-4">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="flex items-center justify-center w-24 h-24 text-2xl font-bold text-white bg-gray-800 rounded hover:bg-gray-600"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IndexPage;
