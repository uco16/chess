import { arraysEqual, copyMatrix } from './jslogic.js';
import { numMovesPlayed } from './movelist.js';

// Client-side script to determine whether a move is legal in the current position

// main script that will be exported and used by the sketch to decide
// whether or not a given move by the player is legal
export default function isLegal(startPos, endPos, pieces, previousMoveFinal, playerColor) {
  // check if move is legal in given position
  //
  // can only move on your own turn (or before start of game)
  if (!isNotEnemyTurn(playerColor)) {
    console.log("Not your turn.");
    return false;
  }
  // end position has to be different to start position
  const startPosIsEndPos = (startPos[0] == endPos[0] && startPos[1] == endPos[1]);
  if (startPosIsEndPos) {
    return false;
  }
  // end position has to be inside the board
  const isOutsideBoard = !(0 <= endPos[0] && endPos[0] < 8 && 0 <= endPos[1] && endPos[1] < 8);
  if (isOutsideBoard) {
    return false;
  }
  // the piece on the end position has to be empty or of opposing color
  let targetPiece = pieces[endPos[0]][endPos[1]];
  if (targetPiece && identifyPiece(targetPiece)[0] == playerColor) {
    return false;
  }
  // piece has to move in a valid way
  if (!isValidPattern(pieces, startPos, endPos, previousMoveFinal)) {
    return false;
  }

  // player cannot be left in check after move
  if (isLeftInCheck(pieces, startPos, endPos)) {
    console.log("This move leaves you in check.")
    return false;
  }

  return true;
}

function isNotEnemyTurn(playerColor) {
  let n = numMovesPlayed();
  if (playerColor == 'white') {
    return (n % 2 == 0);
  } else {
    return (n % 2 == 1);
  }
}

function isValidPattern(position, initial, final, previousMoveFinal) {
  // assumptions:
  //  position: 8x8 matrix with chess pieces as entries
  //
  //  move: [initial, final]
  //	     where initial and final are arrays of the form [col, row]
  //         where 0 <= col, row < 8 are integers
  //  
  //  assume there is a piece of the player's color at 'initial'
  //  and that at 'final' there is a piece of the opponents color or no piece at all

  // piece to be moved
  const piece = position[initial[0]][initial[1]];
  const [color, type] = identifyPiece(piece);

  const patternFunctions = {
    'pawn': isLegalPawnMove,
    'king': isLegalKingMove,
    'bishop': isLegalBishopMove,
    'rook': isLegalRookMove,
    'queen': isLegalQueenMove,
    'knight': isLegalKnightMove,
  };

  if (type == 'pawn') {
    var moveData = [position, initial, final, previousMoveFinal];
  } else {
    var moveData = [position, initial, final];
  }
  return patternFunctions[type](...moveData);
}


// --- auxiliary functions ---

function identifyPiece(piece) {
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

function findPiece(position, color, type) {
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

function isPiece(position, location, color, type) {
  if (isEmpty(position, location)) {
    return false;
  }
  let [pcColor, pcType] = identifyPiece(position[location[0]][location[1]]);
  return (pcColor === color && pcType === type);
}

function isEmpty(position, location) {
  // do this in centralized function in case the implementation of 'position' changes
  if (position[location[0]][location[1]]) {
    return false;
  }
  return true;
}

function isLegalQueenMove(position, initial, final) {
  const isBishopMove = isLegalBishopMove(position, initial, final);
  const isRookMove = isLegalRookMove(position, initial, final);
  return isBishopMove || isRookMove;
}

function isLegalKnightMove(position, initial, final) {
  const colDiff = Math.abs(final[0] - initial[0]);
  const rowDiff = Math.abs(final[1] - initial[1]);
  return (colDiff + rowDiff == 3) ;
}

function isLegalRookMove(position, initial, final) {
  // has to be same column or same row
  if (final[0] == initial[0] || final[1] == initial[1]) {
    if (pathIsBlocked(position, initial, final)) {
      return false;
    } else {
      return true;
    }
  }
  // if initial and final are neither on the same row nor the same column
  return false;
}

function isLegalBishopMove(position, initial, final) {
  // initial and final have to be on a diagonal
  if (Math.abs(final[0] - initial[0]) != Math.abs(final[1] - initial[1])) {
    return false;
  }
  // diagonal has to be empty 
  if (pathIsBlocked(position, initial, final)) {
    return false;
  }
  
  return true;
}

function pathIsBlocked(position, initial, final) {
  // returns true if any piece lies on the path between initial and final
  // can deal with diagonal paths and paths along a column and along a row
  const colDiff = final[0] - initial[0];
  const rowDiff = final[1] - initial[1];

  let colSign;
  let rowSign;
  if (colDiff != 0) {
    colSign = colDiff / Math.abs(colDiff);
  } else {
    colSign = 0;
  }
  if (rowDiff != 0) {
    rowSign = rowDiff / Math.abs(rowDiff);
  } else {
    rowSign = 0;
  }

  const maxColRowDiff = Math.max(Math.abs(colDiff), Math.abs(rowDiff));
  for (let i=1; i < maxColRowDiff; i++) {
    // for each position on the diagonal path, check if it contains a piece
    if (!isEmpty(position, [initial[0]+i*colSign, initial[1]+i*rowSign])) {
      return true;  // a piece blocks the way
    }
  }
}

function isLegalKingMove(position, initial, final) {
  const colDiff = final[0] - initial[0];
  const rowDiff = final[1] - initial[1];
  if (Math.abs(colDiff) <= 1 && Math.abs(rowDiff) <= 1) {
    return true;
  }
  return false;
}

function isLegalPawnMove(position, initial, final, previousMoveFinal) {
  // all pawn moves have to be upwards for white and downwards for black
  const colDiff = final[0] - initial[0];
  const rowDiff = final[1] - initial[1];

  let piece = position[initial[0]][initial[1]];
  let color = identifyPiece(piece)[0];

  if ((color == 'white' && rowDiff <= 0) || (color == 'black' && rowDiff >= 0)) {
    return false;
  }

  // --- EN-PASSANT ---
  if (previousMoveFinal !== null) {
    let previous_move_piece = position[previousMoveFinal[0]][previousMoveFinal[1]];
    let previous_move_type = identifyPiece(previous_move_piece)[1];
    if (previous_move_type == "pawn") {
      if (arraysEqual(initial, [previousMoveFinal[0]-1, previousMoveFinal[1]])
	  || arraysEqual(initial, [previousMoveFinal[0]+1, previousMoveFinal[1]])) {
	// Our pawn started its move from next to an opponent's pawn who just moved there
	// Our pawn can do an enpassant move.
	//
	// If we are white, a valid move lands above that pawn, if black below.
	//
	// Since we already checked the that the direction of the move is consistent
	// with colour, we just need to see if we land in the same column as the opponent.
	if (final[0] == previousMoveFinal[0]) {
	  return true;
	}
      }
    }
  }
  // -------------------

  if (isEmpty(position, final)) {
    if (final[0] == initial[0]) {
      // check: simple pawn move
      if (Math.abs(rowDiff) == 1) {
	return true;
      }
      // check: double move from base row
      const baseRow = {
	'white': 1,
	'black': 6,
      };
      if (Math.abs(rowDiff) == 2 && initial[1] == baseRow[color]) {
	const intermediateSquare = [initial[0], (initial[1] + final[1]) / 2];
	if (isEmpty(position, intermediateSquare)) {
	  return true;  // double pawn move
	}
      }
    }
  } else {
    // check: capture
    if (Math.abs(colDiff) == 1 && Math.abs(rowDiff) == 1) {  // diagonal step
      return true;
    }
  }

  // If none of the above were successful, this was not a valid pawn move.
  return false;
}

function isLeftInCheck(position, initial, final) {
  // return true iff player is in check after move is made

  let piece = position[initial[0]][initial[1]];
  let playerColor = identifyPiece(piece)[0];

  let pos_copy = copyMatrix(position);
  pos_copy[initial[0]][initial[1]] = null;
  pos_copy[final[0]][final[1]] = piece;
  return inCheck(pos_copy, playerColor);
}

function inCheck(position, playerColor) {
  // return true iff playerColor is in check in given position

  let opponentColor;
  if (playerColor === 'white') {
    opponentColor = 'black';
  } else {
    opponentColor = 'white';
  }
  
  // find position of king
  let kingPos = findPiece(position, playerColor, 'king')[0];
  // check if king is under attack by other player
  // knights
  let knightsquares = [[kingPos[0]-1, kingPos[1]+2], 
		       [kingPos[0]-1, kingPos[1]-2],
		       [kingPos[0]+1, kingPos[1]+2],
		       [kingPos[0]+1, kingPos[1]-2],
		       [kingPos[0]-2, kingPos[1]+1],
		       [kingPos[0]-2, kingPos[1]-1],
		       [kingPos[0]+2, kingPos[1]+1],
		       [kingPos[0]+2, kingPos[1]-1]]
  for (let i=0; i<8; i++) {
    if (isPiece(position, knightsquares[i], opponentColor, 'knight')) {
      return true;
    }
  }
  return false;
}

