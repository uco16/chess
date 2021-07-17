// imports from custom client-side functions
import isLegal from './modules/isLegal.js';
import {clearMoveList, addtoMoveList, numMovesPlayed} from './modules/movelist.js';
import {arraysEqual} from './modules/jslogic.js';

function sketch (p, color) {  
  // "instance mode" https://github.com/processing/p5.js/wiki/p5.js-overview#instantiation--namespace

  // default variables
  let size = document.getElementById('chessboard').clientWidth;
  let padding = size/16;  // width of the edge of the board
  let boardsize = size - 2 * padding;
  let sqs = boardsize / 8;
  let pcs = sqs/1.5;
  let playerColor = color;
  let selectedPiece = null;
  let activePieces = [];
  let pieces = [];
  for (let col=0; col<9; col++) {
    pieces[col] = [];
    for (let row=0; row<9; row++) {
      pieces[col][row] = null;
    }
  }
  let pieceImages;
  let previousMoveFinal = null;

  console.log("sketch: match, start game with colour " + playerColor);
  // const socket = io();
  // io from socket.io not explicitly imported since we just include the script in index.html
  // explicitly importing and setting sketch.js to a module seems to break socket.io?

  // define what to do when move is received
  socket.on('move', (initial, final) => {
    move(initial, final);
  });

  p.preload = () => {
    // load images before doing anything else
    pieceImages = {
      'pawn': p.loadImage('client/pieces/pawn.png'),
      'rook': p.loadImage('client/pieces/rook.png'),
      'knight_left': p.loadImage('client/pieces/knight_left.png'),
      'knight_right': p.loadImage('client/pieces/knight_right.png'),
      'bishop_left': p.loadImage('client/pieces/bishop_left.png'),
      'bishop_right': p.loadImage('client/pieces/bishop_right.png'),
      'queen': p.loadImage('client/pieces/queen.png'),
      'king': p.loadImage('client/pieces/king.png'),
      'pawn_white': p.loadImage('client/pieces/pawn_white.png'),
      'rook_white': p.loadImage('client/pieces/rook_white.png'),
      'knight_left_white': p.loadImage('client/pieces/knight_left_white.png'),
      'knight_right_white': p.loadImage('client/pieces/knight_right_white.png'),
      'bishop_left_white': p.loadImage('client/pieces/bishop_left_white.png'),
      'bishop_right_white': p.loadImage('client/pieces/bishop_right_white.png'),
      'queen_white': p.loadImage('client/pieces/queen_white.png'),
      'king_white': p.loadImage('client/pieces/king_white.png'),
    };
  }

  p.setup = () => {
    let canvas = p.createCanvas(size, size);
    //canvas.parent('chessboard');	  // position canvas in html
    drawBoard();
    initializePieces();
    drawUnselectedPieces();
  }

  function initializePieces() {
    // reset variable values
    selectedPiece = null;
    activePieces = [];
    pieces = [];
    for (let col=0; col<9; col++) {
      pieces[col] = [];
      for (let row=0; row<9; row++) {
	pieces[col][row] = null;
      }
    }
    // fill up pieces
    const baseRow = ['rook', 'knight_left', 'bishop_left', 'queen', 
		     'king', 'bishop_right', 'knight_right', 'rook'];
    for (let col = 0; col < 8; col++) {
      let name = baseRow[col];
      let type;
      if (name.length > 6) {
	type = name.slice(0,6);
      } else {
	type = name;
      }
      let wPiece = new ChessPiece([col, 0], 'white', pieceImages[name + '_white'], type);
      activePieces.push(wPiece);
      pieces[col][0] = wPiece;
      let bPiece = new ChessPiece([col, 7], 'black', pieceImages[name], type);
      activePieces.push(bPiece);
      pieces[col][7] = bPiece;

      let wPawn = new ChessPiece([col, 1], 'white', pieceImages['pawn_white'], 'pawn');
      activePieces.push(wPawn);
      pieces[col][1] = wPawn;
      let bPawn = new ChessPiece([col, 6], 'black', pieceImages['pawn'], 'pawn');
      activePieces.push(bPawn);
      pieces[col][6] = bPawn;
    }
  }

  function drawUnselectedPieces() {
    // draw board with pieces, except selected Piece
    for (let i = 0 ; i < activePieces.length; i++) {
      if (activePieces[i] != selectedPiece) {
	activePieces[i].draw();
      }
    }
  }

  function drawBoard() {
    // Board colours
    const darkcol = [128, 64, 0];
    const lightcol = [255, 166, 77];

    // draw the board without pieces
    p.background(204, 68, 0);
    p.strokeWeight(0);
    p.fill(...lightcol);
    p.square(padding, padding, boardsize)
    p.fill(...darkcol);
    let row;
    let col;
    for (col = 0; col < 8; col++) {
      for (row = 0; row < 8; row++) {
	if ((row + col) % 2 == 0) {
	  p.square(...ColRowtoXY(col, row), sqs);
	}
      }
    }
  }

  p.draw = () => {
    if (p.mouseIsPressed && selectedPiece != null) {
      drawBoard();
      drawUnselectedPieces();
      selectedPiece.drag();
    }
  }

  p.mousePressed = () => {
    // mouse down selects/grabs piece of own colour
    let col, row;
    [col, row] = mousePos();
    if (0 <= col && col < 8 && 0 <= row && row < 8) {
      let pieceUnderMouse = pieces[col][row];
      if (pieceUnderMouse != null && pieceUnderMouse.color == playerColor) {
	selectedPiece = pieceUnderMouse;
      }
    }
  }

  p.mouseReleased = () => {
    if (selectedPiece) {
      const startPos = selectedPiece.position;
      const endPos = mousePos();
      drawBoard();
      drawUnselectedPieces();

      if (isValidMove(startPos, endPos)) {
	sendMove(selectedPiece.position, mousePos());  // send move to server
	move(selectedPiece.position, mousePos());  // play move client side
      }
      selectedPiece.draw();
      selectedPiece = null;
    }
  }

  function isValidMove(startPos, endPos) {
    // can only move on your own turn (or before start of game)
    if (!isNotEnemyTurn()) {
      console.log("Not your turn.");
      return false;
    }
    // end position has to be different to start position
    const startPosIsEndPos = (startPos[0] == endPos[0] && startPos[1] == endPos[1]);
    if (startPosIsEndPos) {
      return false;
    }
    // end position has to be inside the board
    const isOutsideBoard = !(0 <= endPos[0] && endPos[0] < 8 && 0 <= endPos[1] && endPos[1] < 8);
    if (isOutsideBoard) {
      return false;
    }
    // the piece on the end position has to be empty or of opposing color
    let targetPiece = pieces[endPos[0]][endPos[1]];
    if (targetPiece && targetPiece.color == playerColor) {
      return false;
    }
    // using function from modules/isLegal.js
    if (isLegal(pieces, [startPos, endPos], previousMoveFinal)) {
      return true;
    }
    return false;
  }

  function sendMove(initial, final) {
    socket.emit('move', initial, final);
    addtoMoveList(initial, final);
  }

  function deactivate(piece) {
    const index = activePieces.indexOf(piece);
    if (index > -1) {
      activePieces.splice(index, 1);
    }
  }

  function move(initial, final) {
    let piece = pieces[initial[0]][initial[1]];
    pieces[initial[0]][initial[1]] = null;

    let targetPiece = pieces[final[0]][final[1]];
    // check for enpassant
    if (previousMoveFinal !== null) {
      let previous_move_piece = pieces[previousMoveFinal[0]][previousMoveFinal[1]];
      if (previous_move_piece.type == "pawn") {
	if (arraysEqual(initial, [previousMoveFinal[0]-1, previousMoveFinal[1]])
	    || arraysEqual(initial, [previousMoveFinal[0]+1, previousMoveFinal[1]])) {
	  if (final[0] == previousMoveFinal[0]) {
	    // is enpassant
	    targetPiece = previous_move_piece;
	    pieces[previousMoveFinal[0]][previousMoveFinal[1]] = null;
	  }
	}
      }
    }
    if (targetPiece) {
      //in the case of a capture, we need to remove the captured piece
      //from the active pieces
      deactivate(targetPiece);
    }

    pieces[final[0]][final[1]] = piece;
    piece.position = final;
    drawBoard();
    drawUnselectedPieces();
    piece.draw();
    previousMoveFinal = final;
  }

  function XYtoColRow(x, y) {
    // transform x, y coordinates into col, row coordinates
    // 
    // x, y are computer graphics style, so y counts form the top
    // whereas col, row counts from bottom left to top right
    let col = Math.floor((x - padding)/sqs);
    let row = Math.floor((y - padding)/sqs);
    if (playerColor == 'white') {
      row = 7 - row;
    } else {
      col = 7 - col;
    }
    return [col, row];
  }

  function ColRowtoXY(col, row) {
    let x;
    let y;
    if (playerColor == 'white') {
      x = padding + col*sqs;
      y = padding + (7 - row)*sqs;
    } else {
      x = padding + (7-col)*sqs;
      y = padding + row*sqs;
    }
    return [x, y];
  }

  function mousePos() {
    // return [col, row] under mouse position
    return XYtoColRow(p.mouseX, p.mouseY);
  }

  function isNotEnemyTurn() {
    let n = numMovesPlayed();
    if (playerColor == 'white') {
      return (n % 2 == 0);
    } else {
      return (n % 2 == 1);
    }
  }

  class ChessPiece {
    constructor(pos, color, img, type) {
      this.position = pos;
      this.color = color;
      this.type = type;
      this.img = img;
    }
    drag() {
      let x, y;
      [x, y] = [p.mouseX - pcs/2, p.mouseY - pcs/1.6];
      p.image(this.img, x, y, pcs, pcs);
    }
    draw() {
      let x, y;
      [x, y] = ColRowtoXY(...this.position);
      p.image(this.img, x+(sqs-pcs)/2, y+(sqs-pcs)/2, pcs, pcs);
    }
  }

  // mobile device behaviour
  //p.touchMoved = () => {
  //  return false;  // prevent default behaviour
  //}
};

socket.on('match', (color) => {
  new p5((p) => {sketch(p, color)}, 'chessboard');
});
