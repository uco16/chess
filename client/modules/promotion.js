export default function inputPromotion(playerColor) {
  // Display an input field for the user to select the promotion piece.
  // After user input, hide that input field and return the input.
  return new Promise(promoteTo => {
    displayPromotion(playerColor, promoteTo);
  });
}

function displayPromotion(color, promoteTo) {
  let promotionWindow = document.getElementById("promotion");
  promotionWindow.style.display = "block";
  let options = promotionWindow.querySelector(`.options.${color}`);
  options.style.display = 'flex';

  // attach event listeners
  for (let option of options.querySelectorAll('.option')) {
    let type = option.getElementsByTagName('img')[0].alt;
    option.promotionParameters = [color, type, promoteTo];
    option.addEventListener('click', handlePromotionChoice);
  }
}

function handlePromotionChoice(evt) {
  let option = evt.currentTarget;
  let [color, type, promoteTo] = option.promotionParameters;
  hidePromotion(color);
  promoteTo(type);
  option.removeEventListener('click', handlePromotionChoice);
}

function hidePromotion(color) {
  document.getElementById('promotion').style.display = 'none';
}
