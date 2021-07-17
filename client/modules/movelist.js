export function clearMoveList() {
  var moves = document.getElementById('moves');
  if (moves.hasChildNodes()) {
    console.log(moves.childNodes);
    for (let i = 0; i < moves.childNodes.length; i++) {
      moves.removeChild(moves.childNodes[i]);
    }
  }
}

export function addtoMoveList(initial, final) {
  let moves = document.getElementById('moves');
  let item = document.createElement('li');
  // check if isScrolledDown before we add another move to the list
  let isScrolledDown = (moves.scrollHeight - moves.clientHeight <= moves.scrollTop + 1);

  item.textContent = `[${initial}] to [${final}]`;
  moves.appendChild(item);

  if (isScrolledDown) {
    moves.scrollTop = moves.scrollHeight - moves.clientHeight;
  }
}

export function numMovesPlayed() {
  var moves = document.getElementById('moves');
  return moves.childNodes.length;
}

socket.on('match', (color) => {
  clearMoveList();
});

socket.on('move', (initial, final) => {
  addtoMoveList(initial, final);
});
