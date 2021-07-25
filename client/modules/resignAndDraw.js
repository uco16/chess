import concludeGame from './concludeGame.js';

function resign() {
  console.log('Resign.');
  socket.emit('resign');
  concludeGame('loss');
}

function offerDraw() {
  console.log('Offering draw.');
  socket.emit('drawOffer');
  drawButton.disabled=true;
  drawButton.textContent='Offered Draw';
}

function acceptDraw() {
  console.log('accept draw');
  socket.emit('draw');
  concludeGame('draw');
}

export function disableResignAndDrawButtons() {
  resignButton.disabled = true;
  drawButton.disabled = true;
}

export function initializeDrawButton() {
  // only called when you have offered / received a draw but a move is played
  drawButton.disabled = false;
  if (drawButton.textContent = 'Accept Draw') {
    drawButton.textContent = 'Offer Draw';
    drawButton.removeEventListener('click', acceptDraw);
    drawButton.addEventListener('click', offerDraw);
  }
}


// ----- main ---

// get buttons
export const [resignButton, drawButton] = document.getElementById('asideboard').querySelectorAll('button');
//
// add event listeners to these buttons
resignButton.addEventListener('click', resign);
drawButton.addEventListener('click', offerDraw);

// handle what happens if opponent resigns
socket.on('resign', () => {
  concludeGame('win');
});

// handle what happens if opponent offers draw
socket.on('drawOffer', () => {
  console.log('Opponent offered draw.');
  // change button to say "Accept Draw".
  drawButton.textContent = 'Accept Draw';
  // change function to accept rather than offer draw
  drawButton.removeEventListener('click', offerDraw);
  drawButton.addEventListener('click', acceptDraw);
})

// handle what happens if opponent accepts to draw
socket.on('draw', () => {
  console.log('Opponent accepted draw.');
  concludeGame('draw');
});
// handle opponent rejecting draw
socket.on('drawReject', () => {
  console.log('Opponent rejected draw.');
  initializeDrawButton();
});
