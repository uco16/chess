import { any } from './jslogic.js';
import { findPieces } from './chesslogic.js';
import isLegal from './isLegal.js';

// work in progress
export default function isCheckmate(position, playerColor) {
  // return true iff playerColor has no legal moves in the current position

  // find all squares with pieces of player's color
  let playerColorPieces = findPieces(position, playerColor);
  console.log(playerColorPieces);

  // find all moves / movePatterns that these pieces could do
  let moves = [];
  //for (let piece in playerColorPieces) {
  //  moves.push(...pattern)
  //}

  if (any(moves, isLegal)) {
    return true;
  } else {
    return false;
  }
}
