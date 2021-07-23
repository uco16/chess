import { findPieces, isPiece, identifyPiece, isInBoard, 
         firstPiece } from './chesslogic.js';

const oppositeColor = {'white': 'black', 'black': 'white'};

export default function inCheck(position, playerColor) {
  // return true iff playerColor is in check in given position

  let opponentColor = oppositeColor[playerColor];
  
  // find position of king
  let kingPos = findPieces(position, playerColor, 'king')[0];

  // all following functions check if king is under attack by other player
  
  if (attackedByKnight(position, kingPos)) {
    return true;
  }
  // knights

  // columns: rooks & queens
  for (const direction of ['up', 'down', 'left', 'right']) {
    let pc=firstPiece(position, kingPos, direction);
    if (pc !== null) {
      let [color, type] = identifyPiece(pc);
      if (color===opponentColor && (type==='queen' || type==='rook')) {
	return true;
      }
    }
  }
  
  // diagonals: bishops & queens
  for (const direction of ['topright', 'botright', 'botleft', 'topleft']) {
    let pc=firstPiece(position, kingPos, direction);
    if (pc !== null) {
      let [color, type] = identifyPiece(pc);
      if (color===opponentColor && (type==='queen' || type==='bishop')) {
	return true;
      }
    }
  }

  // pawns
  let pawnSquares;
  if (playerColor==='white') {
    pawnSquares = [[kingPos[0]-1, kingPos[1]+1], [kingPos[0]+1, kingPos[1]+1]];
  } else {
    pawnSquares = [[kingPos[0]-1, kingPos[1]-1], [kingPos[0]+1, kingPos[1]-1]];
  }
  for (const pawnSquare of pawnSquares) {
    if (isPiece(position, pawnSquare, opponentColor, 'pawn')) {
      return true;
    }
  }

  // king (only relevant when trying to do a move with the king)
  for (let i=-1; i<=1; i++) {
    for (let j=-1; j<=1; j++) {
      let square = [kingPos[0]+i, kingPos[1]+j];
      if (isPiece(position, square, opponentColor, 'king')) {
	return true;
      }
    }
  }
  return false;
}

// --- auxiliary functions ---

function attackedByKnight(position, kingPos) {
  let knightsquares = [[kingPos[0]-1, kingPos[1]+2], 
		       [kingPos[0]-1, kingPos[1]-2],
		       [kingPos[0]+1, kingPos[1]+2],
		       [kingPos[0]+1, kingPos[1]-2],
		       [kingPos[0]-2, kingPos[1]+1],
		       [kingPos[0]-2, kingPos[1]-1],
		       [kingPos[0]+2, kingPos[1]+1],
		       [kingPos[0]+2, kingPos[1]-1]]

  let kingColor = identifyPiece(position[kingPos[0]][kingPos[1]])[0];
  let attackerColor = oppositeColor[kingColor];

  for (let i=0; i<8; i++) {
    if (isInBoard(knightsquares[i]) && isPiece(position, knightsquares[i], attackerColor, 'knight')) {
      return true;
    }
  }
}
