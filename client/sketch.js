// socket from socket.io module
const socket = io();

// Constants
const size = 400;
const padding = 25;
const boardsize = size - 2 * padding;
const sqs = boardsize / 8;
const pcs = sqs - 20;
const darkcol = [128, 64, 0];
const lightcol = [255, 166, 77];

// Variables
var position = [padding + 10, padding + 10];
var selectedPiece;
var pieces = [];
for (var col=0; col<9; col++) {
  pieces[col] = [];
  for (var row=0; row<9; row++) {
    pieces[col][row] = null;
  }
}

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
  king = new King([3, 3]);
  pieces[3][3] = king;
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
  if (mouseIsPressed && selectedPiece != null) {
    board();
    selectedPiece.drag();
  }
}

function mousePressed() {
  let col, row;
  [col, row] = mousePos();
  selectedPiece = pieces[col][row];
}

function mouseReleased() {
  if (selectedPiece != null) {
    board();
    move(selectedPiece, mousePos())
    selectedPiece = null;
  }
}

function move(piece, destination) {
  // send move information to server
  socket.emit('move', piece.position, destination);
  
  // render the move client-side
  pieces[piece.position[0]][piece.position[1]] = null;
  pieces[destination[0]][destination[1]] = piece;
  piece.position = destination;
  piece.draw();
}

class King {
  constructor(pos) {
    this.position = pos;
    // put king onto the board
  }
  drag() {
    let temp_pos = [mouseX - pcs / 1.6, mouseY - pcs / 1.5];
    fill(0);
    rect(...temp_pos, pcs, pcs);
  }
  draw() {
    fill(0);
    let x, y;
    [x, y] = ColRowtoXY(...this.position);
    rect(x+pcs/2, y+pcs/2, pcs, pcs);
  }
}
