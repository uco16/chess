import {algebraic} from './chesslogic.js';

export function clearMoveList() {
  var moves = document.getElementById('moves');
  if (moves.hasChildNodes()) {
    console.log(moves.childNodes);
    for (let i = 0; i < moves.childNodes.length; i++) {
      moves.removeChild(moves.childNodes[i]);
    }
  }
}

export function addtoMoveList(initial, final, iType, fType, isCheck, isCheckMate) {
  let moves = document.getElementById('moves');
  // check if isScrolledDown BEFORE we add another move to the list
  let isScrolledDown = (moves.scrollHeight - moves.clientHeight <= moves.scrollTop + 1);

  // create new list item on every odd move
  if (numMovesPlayed()%2===0) {
    var item = document.createElement('li');
    moves.appendChild(item);
  } else {
    var item = moves.lastChild;
  }
  // add move to the relevant list item inside a span

  let checkMarker = '';
  if (isCheck) {
    checkMarker = '+';
  }
  if (isCheckMate) {
    checkMarker = '#';
  }
  let move = document.createElement('span');

  if (initial !== undefined) {
    move.innerHTML = `${chessNotation(initial, final, iType, fType)}` + checkMarker;
  } else {
    // no move passed in: print '...' into move list instead
    move.innerHTML = '...';
  }
  item.appendChild(move);

  if (isScrolledDown) {
    moves.scrollTop = moves.scrollHeight - moves.clientHeight;
  }
}

export function numMovesPlayed() {
  let counter = 0;
  var moves = document.getElementById('moves');
  for (let listItem of moves.childNodes) {
    counter += listItem.childNodes.length;
  }
  return counter;
}

function chessNotation(initial, final, iType, fType) {
  // Returns the FIDE notation for given move
  
  // castling notation
  if (iType==='king') {
   if (final[0]-initial[0]===2) {
     // castling right/short/king-side
     return '0-0';
   } else if (final[0]-initial[0]===-2) {
     // castling left/long/queen-side
     return '0-0-0';
   }
  }
  
  // ordinary move
  const letter = {
    'king': 'K',
    'queen': 'Q',
    'rook': 'R',
    'bishop': 'B',
    'knight': 'N',
    'pawn': '',
  };
  let destination = algebraic(final);
  let capture = '';
  if (fType !== 'empty') {
    if (iType === 'pawn') {
      capture = algebraic(initial)[0] + '×';
    } else {
      capture = '×';
    }
  }
  let type = letter[iType];
  return type + capture + destination;
}

//socket.on('match', (color) => {
//  clearMoveList();
//});
