import {arraysAdd, arraysEqual} from './jslogic.js';
import {isInBoard, getDiag, getRow, getCol} from './chesslogic.js';

const knightPattern = [[-1, +2], [-1, -2],
		       [+1, +2], [+1, -2],
		       [-2, +1], [-2, -1],
		       [+2, +1], [+2, -1]];

export function knightSquares(position) {
  let squares = [];
  for (let incrementPattern of knightPattern) {
    squares.push(arraysAdd(position, incrementPattern));
  }
  return squares.filter(sq => isInBoard(sq));
}

function kingSquares(position) {
  // returns array of all squares that a king can move to from 'position'
  let squares = [];
  for (let i=-1; i<=1; i++) {
    for (let j=-1; j<=1; j++) {
      squares.push(arraysAdd(position, [i, j]));
    }
  }
  return squares.filter(sq => isInBoard(sq));
}

function pawnSquares(position, color) {
  let squares = [];
  let dir = 1;
  if (color==='black') { dir = -1 };
  squares.push(arraysAdd(position, [0,dir*1]));  // one step
  squares.push(arraysAdd(position, [0,dir*2]));  // two steps
  squares.push(arraysAdd(position, [1, dir*1])); // diagonal right
  squares.push(arraysAdd(position, [-1, dir*1]));  // diagonal left
  return squares.filter(sq => isInBoard(sq));
}

export function accessibleSquares(piecePos, pieceType, pieceColor) {
  // returns an array of all squares on the board that the piece of type pieceType can 
  // access from position piecePos (irrespective of whether that move is legal)

  if (pieceType==='king') {
    return kingSquares(piecePos);
  }
  if (pieceType==='pawn') {
    return pawnSquares(piecePos, pieceColor)
  }
  if (pieceType==='knight') {
    return knightSquares(piecePos);
  }

  let squares = [];
  if (pieceType==='rook' || pieceType==='queen') {
    // add columns and rows 
    // (note that this includes piecePos twice. Filter out in the end)
    squares.push(...getCol(piecePos[0]));
    squares.push(...getRow(piecePos[1]));
  }
  if (pieceType==='bishop' || pieceType==='queen') {
    // add diagonals
    squares.push(...getDiag(piecePos));
  }
  // filter out the piecePos
  return squares.filter(pos => !arraysEqual(pos, piecePos));
}
