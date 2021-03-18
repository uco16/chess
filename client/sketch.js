// Constants
const size = 400;
const padding = 25;
const boardsize = size - 2 * padding;
const sqs = boardsize / 8;
const pcs = sqs - 20
const darkcol = [128, 64, 0];
const lightcol = [255, 166, 77];

var position = [padding + 10, padding + 10]
var 0

function XYtoColRow(x, y) {
  col = Math.floor((x - padding)/sqs);
  row = Math.floor((y - padding)/sqs);
  return [col, row];
}

function ColRowtoXY(col, row) {
  x = padding + col*sqs;
  y = padding + row*sqs;
  return [x, y];
}

function mousePos() {
  // return [col, row] under mouse position
  return XYtoColRow(mouseX, mouseY);
}

function setup() {
  createCanvas(size, size);
  board();
  king = new King([138 - pcs / 1.6, 314 - pcs / 1.5]);
  king.draw();
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
        square(...ColRowtoXY(col, row), sqs);
      }

    }
  }
}

function draw() {
  if (mouseIsPressed) {
    board();
    king.drag();
  }
}

function mouseReleased() {
  board();
  king.draw();
}


class King {
  constructor(pos) {
    this.position = pos
  }
  drag() {
    let temp_pos = [mouseX - pcs / 1.6, mouseY - pcs / 1.5];
    fill(0);
    rect(...temp_pos, pcs, pcs);
  }
  draw() {
    fill(0);
    rect(...this.position,
      pcs, pcs);
  }
}