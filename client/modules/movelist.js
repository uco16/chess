export function clearMoveList() {
  var moves = document.getElementById('moves');
  if (moves.hasChildNodes()) {
    console.log(moves.childNodes);
    for (let i = 0; i < moves.childNodes.length; i++) {
      moves.removeChild(moves.childNodes[i]);
    }
  }
}

export function addtoMoveList(initial, final, iType, fType) {
  let moves = document.getElementById('moves');
  let item = document.createElement('li');
  // check if isScrolledDown before we add another move to the list
  let isScrolledDown = (moves.scrollHeight - moves.clientHeight <= moves.scrollTop + 1);

  item.textContent = `${chessNotation(initial, iType)}, ${chessNotation(final, fType)}`;
  moves.appendChild(item);

  if (isScrolledDown) {
    moves.scrollTop = moves.scrollHeight - moves.clientHeight;
  }
}

export function numMovesPlayed() {
  var moves = document.getElementById('moves');
  return moves.childNodes.length;
}

function chessNotation(position, type) {
  // Returns the chess notation for a given matrix position
  let [column, row] = position;
  let letter = 'abcdefgh'[column];
  let number = (row+1).toString();
  let abbrev = {
    'empty': '',
    'pawn': '',
    'knight': 'N',
    'king': 'K',
    'rook': 'R',
    'bishop': 'B',
    'queen': 'Q',
  }
  console.log(abbrev, type);
  return abbrev[type].concat(letter, number);
}

//socket.on('match', (color) => {
//  clearMoveList();
//});

socket.on('move', (initial, final, iname, fname) => {
  addtoMoveList(initial, final, iname, fname);
  console.log("movelist: received move", initial, final, iname, fname);
});
