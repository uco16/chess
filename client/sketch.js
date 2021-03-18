let size = 400;
let padding = 25;
let boardsize = size - 2 * padding;
let sqs = boardsize / 8;
const darkcol = [128, 64, 0];
const lightcol = [255, 166, 77];

function setup() {
  createCanvas(size, size);
  board();
}

function board() {
  background(204, 68, 0);
  strokeWeight(0);
  fill(...lightcol);
  square(padding, padding, boardsize)
  fill(...darkcol);
  var row;
  var col;
  for (col = 0; col < 8; col++) {
    for (row = 0; row < 8; row++) {
      if ((row + col) % 2 == 0) {
        square(padding + col * sqs, padding + row * sqs, sqs);
      }

    }
  }
}

var position = [padding + 10, padding + 10]
var pcs = sqs - 20

function draw() {
  if (mouseIsPressed) {
    position = [mouseX - pcs / 1.6, mouseY - pcs / 1.5];
    board();
    fill(0);
    rect(...position,
      pcs, pcs);
  }

}