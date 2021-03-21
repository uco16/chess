// imports from custom client-side functions
//import isLegal from './modules/isLegal.js';
//not explicitly imported since we just include the script in index.html
// explicitly importing and setting sketch.js to a module seems to break socket.io?

// socket from socket.io module
const socket = io();

// Constants
const size = 400;
const padding = 25;
const boardsize = size - 2 * padding;
const sqs = boardsize / 8;
const pcs = sqs/1.5;
const darkcol = [128, 64, 0];
const lightcol = [255, 166, 77];

// Variables
var position = [padding + 10, padding + 10];
var selectedPiece;
var activePieces;
var pieces = [];
for (var col=0; col<9; col++) {
  pieces[col] = [];
  for (var row=0; row<9; row++) {
    pieces[col][row] = null;
  }
}

function setup() {
  var canvas = createCanvas(size, size);
  // move canvas into correct html object
  canvas.parent('chessboard');
  

  placePieces();
  boardAndPieces(); // draw board and pieces

  // define what to do when move is received
  socket.on('move', (initial, final) => {
    console.log('received move');
    move(initial, final);
  });
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

function preload() {
  // nothing else happens before all load calls in here are finished
  // to make sure we do not try to draw an image without loading it first
  wKingImg = loadImage('client/pieces/king_white.png');
  bKingImg = loadImage('client/pieces/king_black.png');
}

function placePieces() {
  king1 = new wKing([3, 3]);
  king2 = new bKing([4, 4]);
  pieces[3][3] = king1;
  pieces[4][4] = king2;
  activePieces = [king1, king2];
}

function boardAndPieces() {
  // draw board with pieces, except selected Piece
  board();
  for (let i = 0 ; i < activePieces.length; i++) {
    if (activePieces[i] != selectedPiece) {
      activePieces[i].draw();
    }
  }
}

function board() {
  // draw the board without pieces
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
    boardAndPieces();
    selectedPiece.drag();
  }
}

function mousePressed() {
  let col, row;
  [col, row] = mousePos();
  if (0 <= col && col < 8 && 0 <= row && row < 8) {
    selectedPiece = pieces[col][row];
  }
}

function mouseReleased() {
  if (selectedPiece != null) {
    const startPos = selectedPiece.position;
    const endPos = mousePos();
    const isInsideBoard = (0 <= endPos[0] && endPos[0] < 8 && 0 <= endPos[1] && endPos[1] < 8);
    const positionHasChanged = (startPos[0] != endPos[0] || startPos[1] != endPos[1]);

    boardAndPieces();
    // check if move is legal by using function from modules/isLegal.js
    if (positionHasChanged && isInsideBoard && isLegal(pieces, [startPos, endPos])) {
      sendMove(selectedPiece.position, mousePos());  // send move to server
      move(selectedPiece.position, mousePos());  // play move client side
    } else {
      console.log("Illegal Move ", move);
    }
    selectedPiece.draw();
    selectedPiece = null;
  }
}

function sendMove(initial, final) {
  socket.emit('move', initial, final);
  console.log("emitted move");
  addtoMoveList(initial, final);
}

function deactivate(piece) {
  const index = activePieces.indexOf(piece);
  if (index > -1) {
    activePieces.splice(index, 1);
  }
}

function move(initial, final) {
  piece = pieces[initial[0]][initial[1]];
  pieces[initial[0]][initial[1]] = null;

  targetPiece = pieces[final[0]][final[1]];
  if (targetPiece) {
    //in the case of a capture, we need to remove the captured piece
    //from the active pieces
    deactivate(targetPiece);
  }

  pieces[final[0]][final[1]] = piece;
  piece.position = final;
  boardAndPieces();
  piece.draw();
}

class ChessPiece {
  constructor(pos, color, img) {
    this.position = pos;
    this.color = color;
    this.img = img;
  }
  drag() {
    let x, y;
    [x, y] = [mouseX - pcs/2, mouseY - pcs/1.6];
    image(this.img, x, y, pcs, pcs);
  }
  draw() {
    let x, y;
    [x, y] = ColRowtoXY(...this.position);
    image(this.img, x+(sqs-pcs)/2, y+(sqs-pcs)/2, pcs, pcs);
  }
}

class wKing extends ChessPiece {
  constructor(pos) {
    super(pos, 'white', wKingImg);
    this.type = 'king';
  }
}
class bKing extends ChessPiece {
  constructor(pos) {
    super(pos, 'black', bKingImg);
    this.type = 'king';
  }
}
