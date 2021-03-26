// Client-side script to determine whether a move is legal in the current position

// main script that will be exported and used by the sketch to decide
// whether or not a given move by the player is legal
function isLegal(position, move, enpassantSquares=[[-1,-1], [-1,-1], [-1, -1]]) {
  // check if move is legal in given position
  //
  // assumptions:
  //  position: 8x8 matrix with chess pieces as entries
  //
  //  move: [initial, final]
  //	     where initial and final are arrays of the form [col, row]
  //         where 0 <= col, row < 8 are integers
  //  
  //  assume there is a piece of the player's color at 'initial'
  //  and that at 'final' there is a piece of the opponents color or no piece at all
  //
  //  enpassantSquares: [left, center, right] three coordinates identifying where a pawn
  //			can make an enpassant move from and to, if no move is possible, 
  //			assume left, right are out of bounds, e.g. left = right = -1.

  const initial = move[0];
  const final = move[1];
  // piece to be moved
  const piece = position[initial[0]][initial[1]];
  const [color, type] = identifyPiece(piece);

  switch (type) {
    case 'pawn': 
      return isLegalPawnMove(position, initial, final, color, enpassantSquares);
    case 'king':
      return isLegalKingMove(position, initial, final);
    case 'bishop':
      return isLegalBishopMove(position, initial, final);
    case 'rook':
      return isLegalRookMove(position, initial, final);

    //case 'queen':
    //  const isBishopMove = isLegalBishopMove(position, initial, final);
    //  const isRookMove = isLegalRookMove(position, initial, final);
    //  return isBishopMove || isRookMove;
  }
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
  const type = piece.type;
  const color = piece.color;
  return [color, type];
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
    if (position[initial[0]+i*colSign][initial[1]+i*rowSign]) {
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

function isLegalPawnMove(position, initial, final, color, enpassantSquares) {
  // all pawn moves have to be upwards for white and downwards for black
  const colDiff = final[0] - initial[0];
  const rowDiff = final[1] - initial[1];

  if ((color == 'white' && rowDiff <= 0) || (color == 'black' && rowDiff >= 0)) {
    return false;
  }

  // --- EN-PASSANT ---
  if (initial == enpassantSquares[0] || initial == enpassantSquares[2]) {
    // Our pawn can do an enpassant move.
    //
    // If we are white, a valid move lands above that pawn, if black below.
    //
    // Since we already checked the that the direction of the move is consistent
    // with colour, we just need to see if we land in the same column as the opponent.
    if (final[0] == enpassantSquares[1][0]) {
      return true;
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
    if (Math.abs(colDiff) == 1) {  // diagonal step
      return true;
    }
  }

  // If none of the above were successful, this was not a valid pawn move.
  return false;
}

function isEmpty(position, location) {
  // do this in centralized function in case the implementation of 'position' changes
  if (position[location[0]][location[1]]) {
    return false;
  }
  return true;
}

