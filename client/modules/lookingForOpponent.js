// script is executed when going to /play
// hides the #gamewindow until a match is found

import chessSketch from '/client/modules/chessSketch.js';
import {addtoMoveList} from '/client/modules/movelist.js';

let verbose = true;

socket.on('match', (color, FEN) => {
  // display #gamewindow
  document.getElementById('lookingForOpponent').style.display = 'none';
  document.getElementById('gamewindow').style.display = 'flex';
  startMatch(color, FEN);
});

socket.emit('readyForMatch');

function startMatch(playerColor, FEN) {
  if (verbose) {console.log("match, start game with colour " + playerColor);}
  new p5(chessSketch(playerColor, FEN), 'chessboard');

  // if the game starts from a position where it is black's turn to move, 
  // add one empty move (i.e. "1. ...") to the movelist
  if (FEN.split(' ')[1]==='b') { addtoMoveList(); };
}
