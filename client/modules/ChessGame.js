import {nullMatrix} from './jslogic.js';
import ChessPiece from './ChessPiece.js';

export default class ChessGame {
  // keep track and manipulate ChessPiece objects
  constructor(p, pieceImages) {
    this.pieceImages = pieceImages;
    this.initializePieces(p);
  }
  initializePieces(p) {
    // reset variable values
    this.activePieces = [];
    this.pieces = nullMatrix(9,9);
    // fill up pieces
    const baseRow = ['rook', 'knight_left', 'bishop_left', 'queen', 
		     'king', 'bishop_right', 'knight_right', 'rook'];
    for (let col = 0; col < 8; col++) {
      let name = baseRow[col];
      this.createPiece([col, 0], 'white', name, p);
      this.createPiece([col, 7], 'black', name, p);
      this.createPiece([col, 1], 'white', 'pawn', p);
      this.createPiece([col, 6], 'black', 'pawn', p);
    }
  }
  createPiece(pos, color, name, p) {
    let type;
    if (name.length > 6) {
      type = name.slice(0,6);
    } else {
      type = name;
    }
    if (color === 'white') {
      name = name + '_white';
    }
    let piece = new ChessPiece(pos, color, this.pieceImages[name], type, p);
    this.activePieces.push(piece);
    this.pieces[pos[0]][pos[1]] = piece;
  }
  deactivate(piece) {
    const index = this.activePieces.indexOf(piece);
    if (index > -1) {
      this.activePieces.splice(index, 1);
    }
  }
  isEmpty(coordinates) {
    // check if there is a piece on square coordinates
    if (this.pieces[coordinates[0]][coordinates[1]]) {
      return false;
    }
    return true;
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
}
