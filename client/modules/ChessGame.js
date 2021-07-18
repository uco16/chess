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
}
