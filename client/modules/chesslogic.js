import { arraysAdd } from './jslogic.js';

// logic that is to be used by all functions related to chess
export const chessPieceTypes = ['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'];

export function algebraic(position) {
  // Returns the algebraic notation for a given matrix position
  let [column, row] = position;
  let letter = 'abcdefgh'[column];
  let number = (row+1).toString();
  return letter + number;
}

export function matrixNotation(algebraic) {
  // returns the matrix notation for a given algebraic notation
  // algebraic is a string such as 'a1', ie one letter and one number
  let column = algebraic.charCodeAt(0) - 97;
  let row = algebraic[1]-1;
  return [column, row];
}

export function findPieces(position, color, type) {
  // finds all squares with pieces of specified type and color on it
  if (typeof type === 'undefined') {  // return all 'color' pieces when type not specified
    let colorPieces = [];
    for (let type of chessPieceTypes) {
      colorPieces.push(...findPieces(position, color, type));
    }
    return colorPieces;
  } else {
    let findings = [];
    for (var col=0; col<9; col++) {
      for (var row=0; row<9; row++) {
	if (isPiece(position, [col, row], color, type)) {
	  findings.push([col, row]);
	}
      }
    }
    return findings;
  }
}

export function isPiece(position, location, color, type) {
  if (isEmpty(position, location)) {
    return false;
  }
  let [pcColor, pcType] = identifyPiece(position[location[0]][location[1]]);
  return (pcColor === color && pcType === type);
}

export function isEmpty(position, location) {
  // do this in centralized function in case the implementation of 'position' changes
  if (position[location[0]][location[1]]) {
    return false;
  }
  return true;
}

export function identifyPiece(piece) {
  // Return the color and type of piece.
  // 
  // The first return value is the color ('white' or 'black') and the second is the type,
  // with options being 'pawn', 'king', 'queen', 'bishop', 'rook', and 'knight'.
  //
  //  The implementation depends on which type of object 'piece' is,
  //  so we handle this as an external function to be able to adjust it in the future.
  const color = {'w': 'white', 'b': 'black'};
  const type = {
    'P': 'pawn',
    'R': 'rook',
    'N': 'knight',
    'B': 'bishop',
    'K': 'king',
    'Q': 'queen',
  };
  return [color[piece[0]], type[piece[1]]];
}

export function isInBoard(position) {
  return (0 <= position[0] && position[0] < 8 && 0 <= position[1] && position[1] < 8);
}

export function firstPiece(position, square, direction) {
  // returns first piece in line of sight of square
  const step = {  // specifies what one step in the given direction looks like
    'up': [0, 1],  // do not increment column, but increment row
    'down': [0, -1],  // decrement row
    'left': [-1, 0],
    'right': [1, 0],
    'topright': [1, 1],
    'botright': [1, -1],
    'topleft': [-1, 1],
    'botleft': [-1, -1],
  };
  let curPos = square.slice();  // shallow copy
  for (let i=0; i<8; i++) {
    curPos = arraysAdd(curPos, step[direction]);  // make one step in direction
    if (!isInBoard(curPos)) {
      break;
    }
    if (!isEmpty(position, curPos)) {
      return position[curPos[0]][curPos[1]];
    }
  }
  // no piece in line of sight in column/row direction from square
  return null;
}

export function getDiag(coordinates) {
  // returns all squares that are on the diagonals of coordinates
  let squares = [coordinates];
  for (let increment of [[1,1], [1,-1], [-1,1], [-1,-1]]) {
    for (let sq=arraysAdd(coordinates, increment); isInBoard(sq); sq = arraysAdd(sq, increment)) {
      squares.push(sq);
    }
  }
  return squares;
}

export function getRow(n) {
  // all squares on a given row
  let squares = [];
  for (let col=0; col<8; col++) {
    squares.push([col, n]);
  }
  return squares;
}
export function getCol(n) {
  // all squares on a given column
  let squares = [];
  for (let row=0; row<8; row++) {
    squares.push([n, row]);
  }
  return squares;
}
