export default class ChessPiece {
  constructor(pos, color, img, type) {
    this.position = pos;
    this.color = color;
    this.img = img;
    this.type = type;
  }
  strRep() {
    const abbrev = {
      'pawn': 'P',
      'knight': 'N',
      'king': 'K',
      'rook': 'R',
      'bishop': 'B',
      'queen': 'Q',
    }
    return this.color[0].concat(abbrev[this.type]);
  }
}
