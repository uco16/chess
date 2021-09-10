// script is executed when going to /play or /computer
// hides the #gamewindow until a match is found

import chessSketch from '/client/modules/chessSketch.js';
import {addtoMoveList} from '/client/modules/movelist.js';
import ChessGame from '/client/modules/ChessGame.js';

function startMatch(matchData) {
  let game = new ChessGame(matchData.position);
  new p5(chessSketch(matchData, game), 'chessboard');

  // if the game starts from a position where it is black's turn to move, 
  // add one empty move (i.e. "1. ...") to the movelist
  if (matchData.position.split(' ')[1]==='b') { addtoMoveList(); };
}

// ---- MAIN -----

let verbose = true;

socket.on('match', (matchData) => {
  // display #gamewindow
  document.getElementById('lookingForOpponent').style.display = 'none';
  document.getElementById('gamewindow').style.display = 'flex';
  startMatch(matchData);
});

let url = window.location.href;
if (url.substring(url.length-8)==='computer')
  socket.emit('readyForMatch', 'computer');
else
  socket.emit('readyForMatch', 'player');
