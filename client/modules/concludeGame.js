import {disableResignAndDrawButtons} from './resignAndDraw.js';

export default function concludeGame(gameOutcome) {
  // handle win/loss/draw
  displayEndscreen(gameOutcome);
  disableResignAndDrawButtons();
}

function displayEndscreen(gameOutcome) {
  let endscreen = document.getElementById("endscreen");

  let outcomeDisplay = endscreen.getElementsByTagName('h2')[0];
  const outcomeMessages = {'win': 'You won!', 'loss': 'You lost.', 'draw': 'Draw.'};
  outcomeDisplay.textContent = outcomeMessages[gameOutcome];

  endscreen.style.display = "flex";
}
