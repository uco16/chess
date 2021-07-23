import { any } from './jslogic.js';
import { findPieces, identifyPiece } from './chesslogic.js';
import isLegal from './isLegal.js';
import { accessibleSquares } from './patterns.js';

export default function isCheckmate(position, playerColor, previousMoveFinal, canCastle, activeColor) {
  // Return true iff playerColor has no legal moves in the current position.
  // game is ChessGame object
  // playerColor is 'white' or 'black'

  // find all squares with pieces of player's color
  let playerColorPiecePositions = findPieces(position, playerColor);

  // find all moves / movePatterns that these pieces could do
  for (let piecePos of playerColorPiecePositions) {
    let [pieceColor, pieceType] = identifyPiece(position[piecePos[0]][piecePos[1]]);
    for (let endPos of accessibleSquares(piecePos, pieceType, pieceColor)) {
      if (isLegal(piecePos, endPos, position, previousMoveFinal, playerColor, canCastle, activeColor)) {
	// there exists a legal move that gets player out of check: not checkmate
	return false;
      }
    }
  }
  // no legal move found: checkmate
  return true;
}
