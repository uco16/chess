import {nullMatrix, arraysEqual} from './jslogic.js';
import ChessPiece from './ChessPiece.js';
import isLegal from './isLegal.js';

export default class ChessGame {
  // keep track and manipulate ChessPiece objects
  constructor(pieceImages) {
    this.pieceImages = pieceImages;
    this.initializePieces();
    this.previousMoveFinal = null;
    this.movesPlayed = [];

    // castling variables: 
    // if king or rook moves, we cannot castle on that side anymore
    // left: left side of board from white's perspective
    this.canCastle = {'white': {'left': true, 'right': true},
                      'black': {'left': true, 'right': true}}

    // FEN: halfmoveClock counts the number of halfmoves since the last pawn advance or capturing move
    // used for the fifty move draw rule
    this.halfmoveClock = 0;
  }

  initializePieces() {
    // reset variable values
    this.activePieces = [];
    this.pieces = nullMatrix(9,9);
    // fill up pieces
    const baseRow = ['rook', 'knight_left', 'bishop_left', 'queen', 
		     'king', 'bishop_right', 'knight_right', 'rook'];
    for (let col = 0; col < 8; col++) {
      let name = baseRow[col];
      this.createPiece([col, 0], 'white', name);
      this.createPiece([col, 7], 'black', name);
      this.createPiece([col, 1], 'white', 'pawn');
      this.createPiece([col, 6], 'black', 'pawn');
    }
  }

  createPiece(pos, color, name) {
    // creates and adds to the game a new ChessPiece object
    // note that "name" requires type + "_left" or "_right' in case of knights and bishops
    let type;
    if (name.length > 6) {
      type = name.slice(0,6);
    } else {
      type = name;
    }
    if (color === 'white') {
      name = name + '_white';
    }
    let piece = new ChessPiece(pos, color, this.pieceImages[name], type);
    this.activePieces.push(piece);
    this.pieces[pos[0]][pos[1]] = piece;
  }

  getPiece(coordinates) {
    // return the ChessPiece at given coordinates
    return this.pieces[coordinates[0]][coordinates[1]];
  }

  setPiece(coordinates, piece) {
    this.pieces[coordinates[0]][coordinates[1]] = piece;
    if (piece !== null) {
      piece.position = coordinates;
    }
  }

  deletePiece(coordinates) {
    let piece = this.getPiece(coordinates);
    this.deactivate(piece);
    this.setPiece(coordinates, null);
  }

  deactivate(piece) {
    this.activePieces = this.activePieces.filter(pc => pc !== piece);
  }

  isEmpty(coordinates) {
    // check if there is a piece on square coordinates
    if (this.getPiece(coordinates)) {
      return false;
    }
    return true;
  }

  move(initial, final) {
    let piece = this.getPiece(initial);
    this.setPiece(initial, null);

    let targetPiece = this.getPiece(final);
    // check for enpassant
    if (this.previousMoveFinal !== null) {
      let previous_move_piece = this.getPiece(previousMoveFinal);
      if (previous_move_piece.type == "pawn") {
	if (arraysEqual(initial, [previousMoveFinal[0]-1, previousMoveFinal[1]])
	    || arraysEqual(initial, [previousMoveFinal[0]+1, previousMoveFinal[1]])) {
	  if (final[0] == previousMoveFinal[0]) {
	    // is enpassant
	    targetPiece = previous_move_piece;
	    this.setPiece(previousMoveFinal, null);
	  }
	}
      }
    }
    if (targetPiece) {
      //in the case of a capture, we need to remove the captured piece
      //from the active pieces
      this.deactivate(targetPiece);
    }

    this.setPiece(final, piece);
    this.movesPlayed.push([initial, final]);

    if (targetPiece || piece.type==='pawn') {
      // was pawn move or capture: reset halfmoveClock
      this.halfmoveClock = 0;
    } else {
      // was other half move: increment halfmoveClock
      this.halfmoveClock++;
    }

    // if king or rook was moved, disallow future castling
    let playerColor = piece.color;
    let baseRow = {'white': 0, 'black': 7};
    if (piece.type==='king') {
      // check if this move is a castling move
      if (final[0]-initial[0]===2) {
	// king moves two columns to the right: is castling right
	// move right rook over to the left of king
	this.move([7, baseRow[playerColor]], [5, baseRow[playerColor]]);
      } else if (final[0]-initial[0]===-2) {
	// king moves two columns to the left: castle left
	// move left rook over to the right of the king
	this.move([0, baseRow[playerColor]], [3, baseRow[playerColor]]);
      }

      this.canCastleRight = false; 
      console.log(`${playerColor} cannot castle right anymore`)
      this.canCastleLeft = false;
      console.log(`${playerColor} cannot castle left anymore`)
    } else if (piece.type==='rook') {
      if (arraysEqual(initial, [0, baseRow[playerColor]])) {
	this.canCastle[playerColor]['left'] = false;
	console.log(`${playerColor} cannot castle left anymore`)
      }
      if (arraysEqual(initial, [7, baseRow[playerColor]])) {
	this.canCastle[playerColor]['right'] = false;
	console.log(`${playerColor} cannot castle right anymore`)
      }
    }
  }

  promote(coordinates, promotionChoice) {
    let pawnColor = this.getPiece(coordinates).color;
    this.deletePiece(coordinates);  // delete the pawn that is at 'coordinates'
    let name = promotionChoice;
    if (promotionChoice==="knight" || promotionChoice==="bishop") {
      name += '_left';
    }
    this.createPiece(coordinates, pawnColor, name);
  }

  strRep() {
    // returns a matrix where the ChessPiece objects are replaced by their
    // string representation
    let cp = nullMatrix(9,9);
    for (var col=0; col < 9; ++col) {
      for (var row=0; row < 9; ++row) {
	let piece = this.pieces[col][row];
	if (piece !== null) {
	  cp[col][row] = piece.strRep();
	}   
      }
    }
    return cp;
  }

  // ------- FEN ------------

  piecePlacement() {
    // FEN piece placement
    const pieceLetters = {
      'pawn': 'P',
      'knight': 'N',
      'bishop': 'B',
      'rook': 'R',
      'queen': 'Q',
      'king': 'K',
    };
    let piece_placement = '';
    for (let row=7; row >= 0; row--) {
      let counter = 0;
      for (let col=0; col < 8; col++) {
	if (this.isEmpty([col, row])) {
	  counter++;
	} else {
	  if (counter>0) {
	    // append the number ${counter} to the string
	    piece_placement += counter;
	    counter = 0;  // and reset counter
	  }
	  // append the piece type (lower case for black, upper case for white)
	  let piece = this.pieces[col][row];
	  let letter = pieceLetters[piece.type];
	  if (piece.color==='black') {letter = letter.toLowerCase();}
	  piece_placement += letter;
	}
      }
      // end of the row, append ${counter} to string
      if (counter > 0) {piece_placement += counter;}
      // append a '/' to indicate end of row
      piece_placement += '/';
    }
    return piece_placement;
  }

  activeColor() {
    let numMovesPlayed = this.movesPlayed.length;
    return ['white', 'black'][numMovesPlayed%2];
  }

  castlingAvailability() {
    //this.canCastle = {'white': {'left': true, 'right': true},
    //                  'black': {'left': true, 'right': true}}
    let castling_string = '';
    if (this.canCastle['white']['right']) {castling_string += 'K';}  // white kingside
    if (this.canCastle['white']['left']) {castling_string += 'Q';}  // white queenside
    if (this.canCastle['black']['right']) {castling_string += 'k';}  // black kingside
    if (this.canCastle['black']['left']) {castling_string += 'q';}  // black queenside
    if (castling_string==='') {castling_string += '-';}
    return castling_string;
  }

  enPassantTarget() {
    // returns the square that a pawn can move into when capturing en passant
    if (this.movesPlayed.length === 0) { return '-'; }

    // check if last move was double pawn advance
    let [lastMoveInitial, lastMoveFinal] = this.movesPlayed[this.movesPlayed.length-1];
    let lastPiece = this.getPiece(lastMoveFinal);
    if ( lastPiece.type==='pawn' 
        && ( lastMoveFinal[0]-lastMoveInitial[0] === 0 ) 
        && ( Math.abs(lastMoveFinal[1]-lastMoveInitial[1]) === 2 )) {
      let fileChar = 'abcdefgh'[lastMoveFinal[0]];
      let rankDigit = 1 + (lastMoveFinal[1]+lastMoveInitial[1])/2; // FEN uses 1-index
      return fileChar + rankDigit;
    } else {
      return '-';
    }
  }

  fullmoveNumber() {
    return 1 + Math.floor(this.movesPlayed.length/2);
  }

  toFEN() {
    // returns the FEN representation of the current position
    // see 16.1 on https://www.thechessdrum.net/PGN_Reference.txt
    // piecePlacement + activeColor[0] + castlingAvailability + enPassantTarget + halfmoveClock + fullmoveNumber
    
    return [this.piecePlacement(), this.activeColor()[0], this.castlingAvailability(),
            this.enPassantTarget(), this.halfmoveClock, this.fullmoveNumber()].join(' ');
  }
}
