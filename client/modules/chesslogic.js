// logic that is to be used by all functions related to chess

export const chessPieceTypes = ['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'];

export function algebraic(position) {
  // Returns the algebraic notation for a given matrix position
  let [column, row] = position;
  let letter = 'abcdefgh'[column];
  let number = (row+1).toString();
  return letter + number;
}
