import { arraysEqual, copyMatrix, arraysAdd, any } from './jslogic.js';
import { numMovesPlayed } from './movelist.js';
import { chessPieceTypes } from './chesslogic.js';

// Client-side script to determine whether a move is legal in the current position

// main script that will be exported and used by the sketch to decide
// whether or not a given move by the player is legal
export default function isLegal(startPos, endPos, pieces, previousMoveFinal, playerColor, canCastle) {
  // check if move is legal in given position
  //
  // can only move on your own turn (or before start of game)
  // canCastle: dictionary of form {'left': boolean, 'right': boolean}
  //
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
  if (!isInBoard(endPos)) {
    return false;
  }
  // the piece on the end position has to be empty or of opposing color
  let targetPiece = pieces[endPos[0]][endPos[1]];
  if (targetPiece && identifyPiece(targetPiece)[0] == playerColor) {
    return false;
  }
  // piece has to move in a valid way
  if (!isValidPattern(pieces, startPos, endPos, previousMoveFinal, canCastle)) {
    return false;
  }

  // player cannot be left in check after move
  if (isLeftInCheck(pieces, startPos, endPos)) {
    console.log("This move leaves you in check.")
    return false;
  }

  return true;
}

function isInBoard(position) {
  return (0 <= position[0] && position[0] < 8 && 0 <= position[1] && position[1] < 8);
}

function isNotEnemyTurn(playerColor) {
  let n = numMovesPlayed();
  if (playerColor == 'white') {
    return (n % 2 == 0);
  } else {
    return (n % 2 == 1);
  }
}

function isValidPattern(position, initial, final, previousMoveFinal, canCastle) {
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
    'pawn': isValidPawnPattern,
    'king': isValidKingPattern,
    'bishop': isValidBishopPattern,
    'rook': isValidRookPattern,
    'queen': isValidQueenPattern,
    'knight': isValidKnightPattern,
  };

  if (type === 'pawn') {
    var moveData = [position, initial, final, previousMoveFinal];
  } else if (type === 'king') {
    var moveData = [position, initial, final, canCastle];
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

function findPieces(position, color, type) {
  // finds all squares with pieces of specified type and color on it
  if (typeof type === 'undefined') {  // return all 'color' pieces when type not specified
    let playerColorPieces = [];
    for (let type of chessPieceTypes) {
      playerColorPieces.push(...findPieces(position, playerColor, type));
    }
    return playerColorPieces;
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

function isValidQueenPattern(position, initial, final) {
  const isBishopMove = isValidBishopPattern(position, initial, final);
  const isRookMove = isValidRookPattern(position, initial, final);
  return isBishopMove || isRookMove;
}

function isValidKnightPattern(position, initial, final) {
  const colDiff = Math.abs(final[0] - initial[0]);
  const rowDiff = Math.abs(final[1] - initial[1]);
  return (colDiff + rowDiff == 3) ;
}

function isValidRookPattern(position, initial, final) {
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

function isValidBishopPattern(position, initial, final) {
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

function isValidKingPattern(position, initial, final, canCastle) {
  // standard king move: 1 step in any direction
  const colDiff = final[0] - initial[0];
  const rowDiff = final[1] - initial[1];
  if (Math.abs(colDiff) <= 1 && Math.abs(rowDiff) <= 1) {
    return true;
  }
  // castling: only possible if king and the relevant rook have not moved
  // and if there are no pieces in between them
  if (rowDiff === 0) { // king just moves left or right
    let playerColor = identifyPiece(position[initial[0]][initial[1]])[0];
    if (colDiff === 2 && canCastle['right'])  {
      // king moves two steps to the right
      // player can still castle right (so king and right rook are in initial positions)
      let fp = firstPiece(position, initial, 'right');
      let [pieceColor, pieceType] = identifyPiece(fp);
      if (playerColor===pieceColor && 'rook'===pieceType) {
	// first piece to the right is a rook of the player's color
	return true;  // can castle right
      }
    } else if (colDiff === -2 && canCastle['left'])  {
      let fp = firstPiece(position, initial, 'left');
      let [pieceColor, pieceType] = identifyPiece(fp);
      if (playerColor===pieceColor && 'rook'===pieceType) {
	// first piece to the left is a rook of the player's color
	return true;  // can castle left
      }
    }
  }
  return false;
}

function isValidPawnPattern(position, initial, final, previousMoveFinal) {
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

  let pos_copy = copyMatrix(position);  // shallow copy of position
  // make move in the copy matrix
  pos_copy[initial[0]][initial[1]] = null;
  pos_copy[final[0]][final[1]] = piece;
  // test if the player is in check in the new position after making the move
  return inCheck(pos_copy, playerColor);
}

export function inCheck(position, playerColor) {
  // return true iff playerColor is in check in given position

  let opponentColor;
  if (playerColor === 'white') {
    opponentColor = 'black';
  } else {
    opponentColor = 'white';
  }
  
  // find position of king
  let kingPos = findPieces(position, playerColor, 'king')[0];
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
    if (isInBoard(knightsquares[i]) && isPiece(position, knightsquares[i], opponentColor, 'knight')) {
      return true;
    }
  }

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

function firstPiece(position, square, direction) {
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

export function isCheckmate(position, playerColor) {
  // return true iff playerColor has no legal moves in the current position

  // find all squares with playerColor Pieces
  let playerColorPieces = findPieces(position, playerColor);
  console.log(playerColorPieces);
  if (any(moves, isLegal)) {
    return false;
  } else {
    return true;
  }
}
