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
      return isLegalKingMove(position, initial, final, color);
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
    console.log("wrong direction for " + color);
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
      console.log("Enpassant!");
      return true;
    }
  }
  // -------------------

  if (isEmpty(position, final)) {
    if (final[0] == initial[0]) {
      // check: simple pawn move
      if (rowDiff == 1) {
	console.log("simple");
	return true;
      }
      // check: double move from base row
      const baseRow = {
	'white': 1,
	'black': 6,
      };
      if (rowDiff == 2 && initial[1] == baseRow[color]) {
	const intermediateSquare = [initial[0], (initial[1] + final[1]) / 2];
	if (isEmpty(position, intermediateSquare)) {
	  console.log("double");
	  return true;  // double pawn move
	}
      }
    }
  } else {
    // check: capture
    if (Math.abs(colDiff) == 1) {  // diagonal step
      console.log("capture");
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

